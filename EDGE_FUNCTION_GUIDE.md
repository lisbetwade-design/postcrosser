# How to Connect Your Edge Function for Email Notifications

## Quick Setup Steps

### 1. Check Your Edge Function Name

The code currently calls an Edge Function named: **`send-postcard-email`**

If your Edge Function has a different name, update line 601 in `src/contexts/AuthContext.tsx`:

```typescript
const { error: functionError } = await supabase.functions.invoke('YOUR_FUNCTION_NAME', {
```

### 2. What Data Your Edge Function Receives

Your Edge Function will receive this JSON body:

```json
{
  "notificationId": "uuid-here",
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "senderName": "Jane Smith",
  "postcardId": "postcard-uuid"
}
```

### 3. What Your Edge Function Should Do

1. **Receive the request** - Parse the JSON body
2. **Send the email** - Use your email service (Resend, SendGrid, etc.) to send to `recipientEmail`
3. **Return a response**:
   - **Success**: Return status 200 (the app will mark notification as 'sent')
   - **Error**: Return an error status (the app will mark notification as 'failed')

### 4. Example Edge Function Response

**Success response:**
```typescript
return new Response(JSON.stringify({ success: true }), {
  status: 200,
  headers: { "Content-Type": "application/json" },
})
```

**Error response:**
```typescript
return new Response(JSON.stringify({ error: "Error message" }), {
  status: 400,
  headers: { "Content-Type": "application/json" },
})
```

### 5. How It Works Automatically

When a user sends a postcard:
1. ✅ Database trigger creates email notification (already set up)
2. ✅ Client calls your Edge Function (already set up)
3. ✅ Your Edge Function sends the email (you've created this)
4. ✅ Client marks notification as sent/failed (already set up)

### 6. Testing

1. Send a postcard from your app
2. Check browser console for any errors
3. Check Supabase dashboard → `email_notifications` table to see status
4. Check recipient's email inbox

### 7. Verify Your Edge Function Name

To check what your Edge Function is actually named:
- Go to Supabase Dashboard → Edge Functions
- Look at the function name (it's case-sensitive)

Then update the code if needed!

