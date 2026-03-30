CREATE OR REPLACE FUNCTION public.get_session_profiles(p_session_id UUID)
RETURNS TABLE (user_id UUID, display_name TEXT, avatar_color TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.consent_participants AS cp_auth
    WHERE cp_auth.session_id = p_session_id
      AND cp_auth.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Non autorizzato';
  END IF;

  RETURN QUERY
  SELECT
    cp.user_id,
    p.display_name,
    p.avatar_color
  FROM public.consent_participants AS cp
  JOIN public.profiles AS p ON p.id = cp.user_id
  WHERE cp.session_id = p_session_id
  ORDER BY cp.joined_at ASC;
END;
$$;
