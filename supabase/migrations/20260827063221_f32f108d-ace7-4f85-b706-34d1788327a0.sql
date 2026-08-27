REVOKE EXECUTE ON FUNCTION public.data_owner_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.data_member_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.data_owner_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.data_member_ids() TO authenticated;