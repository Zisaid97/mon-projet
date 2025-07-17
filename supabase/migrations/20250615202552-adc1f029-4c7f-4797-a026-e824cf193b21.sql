
-- Étape 1 : Supprimer les règles de sécurité problématiques qui causent la récursion
DROP POLICY IF EXISTS "Users can view memberships of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Organization admins can manage memberships" ON public.organization_members;

-- Étape 2 : Créer une fonction pour vérifier l'appartenance à une organisation en toute sécurité (contourne les RLS pour éviter la boucle)
CREATE OR REPLACE FUNCTION public.is_a_member(_organization_id uuid, _user_id uuid)
RETURNS boolean AS
$$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _organization_id AND user_id = _user_id AND deactivated = false
  );
$$
LANGUAGE sql
STABLE
SECURITY DEFINER;

-- Étape 3 : Créer une fonction pour vérifier le rôle d'administrateur en toute sécurité
CREATE OR REPLACE FUNCTION public.is_org_admin(_organization_id uuid, _user_id uuid)
RETURNS boolean AS
$$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _organization_id AND user_id = _user_id AND role IN ('admin', 'owner') AND deactivated = false
  );
$$
LANGUAGE sql
STABLE
SECURITY DEFINER;

-- Étape 4 : Recréer les règles de sécurité en utilisant les nouvelles fonctions
CREATE POLICY "Users can view memberships of their organizations" 
  ON public.organization_members 
  FOR SELECT 
  USING ( public.is_a_member(organization_id, auth.uid()) );

CREATE POLICY "Organization admins can manage memberships" 
  ON public.organization_members 
  FOR ALL
  USING ( public.is_org_admin(organization_id, auth.uid()) );
