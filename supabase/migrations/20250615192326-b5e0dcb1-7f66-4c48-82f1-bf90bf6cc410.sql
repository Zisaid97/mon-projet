
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deactivated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they are members of" 
  ON public.organizations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid() 
      AND deactivated = false
    )
  );

CREATE POLICY "Organization owners can update their organizations" 
  ON public.organizations 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create organizations" 
  ON public.organizations 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Organization owners can delete their organizations" 
  ON public.organizations 
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- RLS Policies for organization members
CREATE POLICY "Users can view memberships of their organizations" 
  ON public.organization_members 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
      AND om.user_id = auth.uid() 
      AND om.deactivated = false
    )
  );

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

CREATE POLICY "Users can insert themselves as members when invited" 
  ON public.organization_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON public.organizations 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at 
  BEFORE UPDATE ON public.organization_members 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_organizations_owner_id ON public.organizations(owner_id);
