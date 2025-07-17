-- Corriger les fonctions restantes avec search_path mutable (sans ALTER SYSTEM)

CREATE OR REPLACE FUNCTION public.create_default_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Fixer le search_path pour garantir un comportement sécurisé
  PERFORM set_config('search_path', 'public', false);

  -- Création des permissions selon le rôle
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

  ELSE -- Collaborator
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
$function$;

CREATE OR REPLACE FUNCTION public.get_organization_members(org_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, email text, role user_role, joined_at timestamp with time zone, deactivated boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- Fixer le search_path pour garantir un comportement sécurisé
  PERFORM set_config('search_path', 'public', false);

  -- Vérifie si l'utilisateur appelant est membre de l'organisation.
  -- C'est une vérification de sécurité pour s'assurer que seuls les membres peuvent voir les autres membres.
  IF NOT public.is_a_member(org_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this organization.';
  END IF;

  RETURN QUERY
  SELECT
    om.id,
    om.user_id,
    u.email,
    om.role,
    om.joined_at,
    om.deactivated
  FROM
    public.organization_members om
  LEFT JOIN
    auth.users u ON om.user_id = u.id
  WHERE
    om.organization_id = org_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_month_average_rate(user_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- Fixer le search_path pour garantir un comportement sécurisé
  PERFORM set_config('search_path', 'public', false);

  RETURN (
    SELECT average_rate 
    FROM public.monthly_average_exchange_rates 
    WHERE user_id = user_uuid 
      AND year = EXTRACT(YEAR FROM CURRENT_DATE)
      AND month = EXTRACT(MONTH FROM CURRENT_DATE)
  );
END;
$function$;

-- Supprimer la fonction is_a_member() sans paramètres qui semble être un doublon
DROP FUNCTION IF EXISTS public.is_a_member();