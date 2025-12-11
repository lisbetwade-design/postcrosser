-- Create a table to queue email notifications
-- This allows for retry logic and better error handling
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postcard_id UUID NOT NULL REFERENCES postcards(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  sender_name TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_postcard_id ON email_notifications(postcard_id);

-- Function to create email notification when a postcard is received
CREATE OR REPLACE FUNCTION notify_postcard_received()
RETURNS TRIGGER AS $$
DECLARE
  recipient_email TEXT;
  recipient_name TEXT;
  sender_name TEXT;
BEGIN
  -- Get recipient's email and name
  SELECT email, name INTO recipient_email, recipient_name
  FROM profiles
  WHERE id = NEW.recipient_id;

  -- Get sender's name
  SELECT name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Insert notification record if recipient has email
  IF recipient_email IS NOT NULL THEN
    INSERT INTO email_notifications (
      postcard_id,
      recipient_email,
      recipient_name,
      sender_name,
      status
    ) VALUES (
      NEW.id,
      recipient_email,
      recipient_name,
      sender_name,
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create email notification when postcard is inserted
DROP TRIGGER IF EXISTS on_postcard_received ON postcards;
CREATE TRIGGER on_postcard_received
  AFTER INSERT ON postcards
  FOR EACH ROW
  EXECUTE FUNCTION notify_postcard_received();

-- Function to mark email notification as sent (can be called from Edge Function or client)
CREATE OR REPLACE FUNCTION mark_email_notification_sent(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_notifications
  SET status = 'sent', sent_at = NOW()
  WHERE id = notification_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark email notification as failed (can be called from Edge Function or client)
CREATE OR REPLACE FUNCTION mark_email_notification_failed(notification_id UUID, error_msg TEXT)
RETURNS void AS $$
BEGIN
  UPDATE email_notifications
  SET status = 'failed', error_message = error_msg
  WHERE id = notification_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

