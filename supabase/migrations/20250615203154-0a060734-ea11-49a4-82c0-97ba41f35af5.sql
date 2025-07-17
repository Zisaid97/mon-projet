
CREATE OR REPLACE FUNCTION get_organization_members(org_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  role public.user_role,
  joined_at timestamptz,
  deactivated boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
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
$$;
