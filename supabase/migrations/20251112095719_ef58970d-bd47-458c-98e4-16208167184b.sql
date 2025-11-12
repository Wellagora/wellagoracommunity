-- Create messages table for storing contact form submissions
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  recipient_user_id uuid,
  subject text,
  message text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('general', 'partner_contact')),
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone,
  admin_notes text
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Super admins can view all messages
CREATE POLICY "Super admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Super admins can update messages (mark as read, add notes)
CREATE POLICY "Super admins can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Recipients can view messages sent to them
CREATE POLICY "Recipients can view their messages"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = recipient_user_id);

-- Create indexes for faster queries
CREATE INDEX idx_messages_recipient ON public.messages(recipient_user_id);
CREATE INDEX idx_messages_status ON public.messages(status);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);