
select 
  organization_id, 
  role 
from public.organization_members
where user_id = 'c9633306-4f46-4c05-9065-d9c8c8d29903'
  and deactivated = false;
