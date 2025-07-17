-- Fix RLS policies for user_integrations table
DROP POLICY IF EXISTS "Users can manage their own integrations" ON user_integrations;

CREATE POLICY "Users can view their own integrations"
ON user_integrations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
ON user_integrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
ON user_integrations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
ON user_integrations
FOR DELETE
USING (auth.uid() = user_id);

-- Fix RLS policies for notification_templates table
DROP POLICY IF EXISTS "Users can manage their own notification templates" ON notification_templates;

CREATE POLICY "Users can view their own notification templates"
ON notification_templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification templates"
ON notification_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification templates"
ON notification_templates
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification templates"
ON notification_templates
FOR DELETE
USING (auth.uid() = user_id);