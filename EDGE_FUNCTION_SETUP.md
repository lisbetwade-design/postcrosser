# Edge Function Setup for Email Notifications

## Current Implementation

Your application is already set up to call a Supabase Edge Function when a postcard is sent. Here's how it works:

### 1. What Happens When a Postcard is Sent

1. **Database Trigger**: When a postcard is inserted, a database trigger automatically creates a record in the `email_notifications` table with status 'pending'

2. **Client Calls Edge Function**: The `sendPostcardEmailNotification` function in `AuthContext.tsx` calls your Edge Function with this data:
   ```javascript
   {
     notificationId: notification.id,
     recipientEmail: notification.recipient_email,
     recipientName: notification.recipient_name,
     senderName: notification.sender_name,
     postcardId: postcardId
   }
   ```

3. **Edge Function Sends Email**: Your Edge Function should:
   - Receive the data above
   - Send the email using your email service (Resend, SendGrid, etc.)
   - Return success or error

4. **Status Updated**: The client automatically marks the notification as 'sent' or 'failed' based on the response

## 2. Edge Function Name

**Current function name in code**: `send-postcard-email`

If your Edge Function has a different name, update line 601 in `src/contexts/AuthContext.tsx`:

```typescript
const { error: functionError } = await supabase.functions.invoke('YOUR_FUNCTION_NAME', {
```

## 3. Edge Function Requirements

Your Edge Function should:

1. **Accept the request body** with this structure:
   ```typescript
   {
     notificationId: string;
     recipientEmail: string;
     recipientName: string;
     senderName: string;
     postcardId: string;
   }
   ```

2. **Send the email** using your email service

3. **Return a response**:
   - Success: Return `{ success: true }` or any 200 status
   - Error: Return an error response (the client will catch and mark as failed)

## 4. Example Edge Function Structure

Here's what your Edge Function should look like (using Resend as example):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

serve(async (req) => {
  try {
    const { notificationId, recipientEmail, recipientName, senderName, postcardId } = await req.json()

    // Send email using your email service
    const { data, error } = await resend.emails.send({
      from: "Postcrosser <noreply@yourdomain.com>",
      to: recipientEmail,
      subject: `You received a postcard from ${senderName}!`,
      html: `Your custom email HTML here...`,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
```

## 5. Environment Variables

Make sure to set your email service API key in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** > **Settings**
3. Add your API key as a secret (e.g., `RESEND_API_KEY`)

## 6. Testing

To test if it's working:

1. Send a postcard from your app
2. Check the browser console for any errors
3. Check the `email_notifications` table in Supabase to see if status changes to 'sent' or 'failed'
4. Check your email inbox!

## 7. Troubleshooting

- **Function not found**: Make sure the Edge Function name matches exactly
- **Email not sending**: Check your API key is set correctly in Supabase secrets
- **Status stays 'pending'**: Check the Edge Function logs in Supabase dashboard

