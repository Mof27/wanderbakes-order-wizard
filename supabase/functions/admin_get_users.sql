
-- This function allows admins to retrieve user data from auth.users
-- It must be executed with appropriate privileges
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS SETOF auth.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user has the admin role
  IF (SELECT public.has_role('admin')) THEN
    RETURN QUERY SELECT * FROM auth.users;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only administrators can view all users';
  END IF;
END;
$$;
