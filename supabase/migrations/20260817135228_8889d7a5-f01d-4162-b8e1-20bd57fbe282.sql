revoke all on function public.set_updated_at() from anon, authenticated, public;
revoke all on function public.has_role(uuid, public.app_role) from anon, public;
revoke all on function public.claim_membership(text) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.claim_membership(text) to authenticated;