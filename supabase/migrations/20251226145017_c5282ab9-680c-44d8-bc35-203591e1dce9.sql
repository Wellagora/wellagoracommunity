-- Phase 1 continued: Fix remaining critical RLS policies for authenticated-only access

-- AI Conversations - restrict to authenticated
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Super admins can view all conversations" ON public.ai_conversations;

CREATE POLICY "Users can view their own conversations" 
ON public.ai_conversations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
ON public.ai_conversations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.ai_conversations 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all conversations" 
ON public.ai_conversations 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- AI Messages - restrict to authenticated
DROP POLICY IF EXISTS "Users can view their conversation messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Super admins can view all messages" ON public.ai_messages;

CREATE POLICY "Users can view their conversation messages" 
ON public.ai_messages 
FOR SELECT 
TO authenticated
USING (conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages to their conversations" 
ON public.ai_messages 
FOR INSERT 
TO authenticated
WITH CHECK (conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can view all messages" 
ON public.ai_messages 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Notifications - restrict to authenticated
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Notification preferences - restrict to authenticated
DROP POLICY IF EXISTS "Users can manage their own notification preferences" ON public.notification_preferences;

CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Push subscriptions - restrict to authenticated
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Messages - restrict appropriately
DROP POLICY IF EXISTS "Authenticated recipients can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated super admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated super admins can update messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users or service can insert messages" ON public.messages;

CREATE POLICY "Recipients can view their messages" 
ON public.messages 
FOR SELECT 
TO authenticated
USING (auth.uid() = recipient_user_id);

CREATE POLICY "Super admins can view all messages" 
ON public.messages 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update messages" 
ON public.messages 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can insert contact messages" 
ON public.messages 
FOR INSERT 
TO public
WITH CHECK (true);

-- System settings - restrict to authenticated super admins
DROP POLICY IF EXISTS "Authenticated super admins can view settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated super admins can insert settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated super admins can update settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated super admins can delete settings" ON public.system_settings;

CREATE POLICY "Super admins can view settings" 
ON public.system_settings 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert settings" 
ON public.system_settings 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update settings" 
ON public.system_settings 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete settings" 
ON public.system_settings 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Security audit log - restrict to authenticated super admins
DROP POLICY IF EXISTS "Only super admins can view audit logs" ON public.security_audit_log;

CREATE POLICY "Super admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));