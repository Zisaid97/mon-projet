
-- Drop existing policies that depend on the role column
DROP POLICY IF EXISTS "Organization admins can manage memberships" ON public.organization_members;

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'collaborator', 'owner');

-- Create organization invitations table
CREATE TABLE public.organization_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'collaborator',
  invited_by UUID REFERENCES auth.users NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity log table
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permissions table
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  module TEXT NOT NULL,
  can_read BOOLEAN NOT NULL DEFAULT true,
  can_write BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id, module)
);

-- Update organization_members table - first remove default, update values, change type, then add new default
ALTER TABLE public.organization_members ALTER COLUMN role DROP DEFAULT;

UPDATE public.organization_members 
SET role = 'owner' 
WHERE role = 'member';

ALTER TABLE public.organization_members 
ALTER COLUMN role TYPE public.user_role USING role::public.user_role;

ALTER TABLE public.organization_members 
ALTER COLUMN role SET DEFAULT 'collaborator'::public.user_role;

-- Recreate the organization_members policies with the new enum type
CREATE POLICY "Organization admins can manage memberships" 
  ON public.organization_members 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
      AND om.user_id = auth.uid() 
      AND om.role IN ('admin', 'owner') 
      AND om.deactivated = false
    )
  );

-- Enable RLS on new tables
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_invitations
CREATE POLICY "Organization admins can manage invitations" 
  ON public.organization_invitations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = organization_invitations.organization_id 
      AND om.user_id = auth.uid() 
      AND om.role IN ('admin', 'owner') 
      AND om.deactivated = false
    )
  );

CREATE POLICY "Users can view invitations sent to their email" 
  ON public.organization_invitations 
  FOR SELECT 
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- RLS Policies for activity_log
CREATE POLICY "Organization members can view activity log" 
  ON public.activity_log 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = activity_log.organization_id 
      AND om.user_id = auth.uid() 
      AND om.deactivated = false
    )
  );

CREATE POLICY "System can insert activity log" 
  ON public.activity_log 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for permissions
CREATE POLICY "Organization admins can manage permissions" 
  ON public.permissions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = permissions.organization_id 
      AND om.user_id = auth.uid() 
      AND om.role IN ('admin', 'owner') 
      AND om.deactivated = false
    )
  );

CREATE POLICY "Users can view their own permissions" 
  ON public.permissions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_organization_invitations_updated_at 
  BEFORE UPDATE ON public.organization_invitations 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at 
  BEFORE UPDATE ON public.permissions 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_organization_invitations_org_id ON public.organization_invitations(organization_id);
CREATE INDEX idx_organization_invitations_email ON public.organization_invitations(email);
CREATE INDEX idx_organization_invitations_token ON public.organization_invitations(token);
CREATE INDEX idx_activity_log_org_id ON public.activity_log(organization_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_permissions_org_user ON public.permissions(organization_id, user_id);

-- Function to create default permissions for new members
CREATE OR REPLACE FUNCTION public.create_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default permissions based on role
  IF NEW.role = 'admin' OR NEW.role = 'owner' THEN
    INSERT INTO public.permissions (organization_id, user_id, module, can_read, can_write, can_delete)
    VALUES 
      (NEW.organization_id, NEW.user_id, 'dashboard', true, true, true),
      (NEW.organization_id, NEW.user_id, 'marketing', true, true, true),
      (NEW.organization_id, NEW.user_id, 'finances', true, true, true),
      (NEW.organization_id, NEW.user_id, 'profits', true, true, true),
      (NEW.organization_id, NEW.user_id, 'settings', true, true, true);
  ELSIF NEW.role = 'manager' THEN
    INSERT INTO public.permissions (organization_id, user_id, module, can_read, can_write, can_delete)
    VALUES 
      (NEW.organization_id, NEW.user_id, 'dashboard', true, true, false),
      (NEW.organization_id, NEW.user_id, 'marketing', true, true, false),
      (NEW.organization_id, NEW.user_id, 'finances', true, true, false),
      (NEW.organization_id, NEW.user_id, 'profits', true, true, false),
      (NEW.organization_id, NEW.user_id, 'settings', true, false, false);
  ELSE -- collaborator
    INSERT INTO public.permissions (organization_id, user_id, module, can_read, can_write, can_delete)
    VALUES 
      (NEW.organization_id, NEW.user_id, 'dashboard', true, false, false),
      (NEW.organization_id, NEW.user_id, 'marketing', true, false, false),
      (NEW.organization_id, NEW.user_id, 'finances', true, false, false),
      (NEW.organization_id, NEW.user_id, 'profits', true, false, false),
      (NEW.organization_id, NEW.user_id, 'settings', false, false, false);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default permissions
CREATE TRIGGER create_default_permissions_trigger
  AFTER INSERT ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.create_default_permissions();
