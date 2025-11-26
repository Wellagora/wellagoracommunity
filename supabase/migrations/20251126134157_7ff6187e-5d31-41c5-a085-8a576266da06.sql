-- Create AI conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_count INTEGER NOT NULL DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI messages table
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_project_id ON public.ai_conversations(project_id);
CREATE INDEX idx_ai_conversations_started_at ON public.ai_conversations(started_at DESC);
CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_timestamp ON public.ai_messages(timestamp DESC);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.ai_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for ai_messages
CREATE POLICY "Users can view their conversation messages"
  ON public.ai_messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.ai_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their conversations"
  ON public.ai_messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.ai_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all messages"
  ON public.ai_messages
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create function to update last_message_at and message_count
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_conversations
  SET 
    last_message_at = NEW.timestamp,
    message_count = message_count + 1
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update conversation metadata
CREATE TRIGGER update_conversation_metadata
  AFTER INSERT ON public.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();