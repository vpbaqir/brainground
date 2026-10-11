-- Security hardening: keep the SECURITY DEFINER publish RPC out of the
-- public PostgREST surface. Browser clients must write through RLS-protected
-- table policies; privileged server-side calls may use service_role.
REVOKE EXECUTE ON FUNCTION public.publish_config(jsonb, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_config(jsonb, integer) TO service_role;
