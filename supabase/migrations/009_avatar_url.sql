-- Aggiunge campo avatar_url alla tabella profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Aggiorna la funzione upsert_my_profile per accettare avatar_url
CREATE OR REPLACE FUNCTION public.upsert_my_profile(
  p_display_name TEXT,
  p_avatar_color TEXT,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid TEXT := requesting_user_id();
  v_profile public.profiles;
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_color, avatar_url)
  VALUES (v_uid, p_display_name, p_avatar_color, p_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_color = EXCLUDED.avatar_color,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

-- Aggiorna get_session_profiles per ritornare anche avatar_url
CREATE OR REPLACE FUNCTION public.get_session_profiles(p_session_id UUID)
RETURNS TABLE (
  user_id TEXT,
  display_name TEXT,
  avatar_color TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica che l'utente sia partecipante della sessione
  IF NOT EXISTS (
    SELECT 1 FROM consent_participants
    WHERE session_id = p_session_id AND user_id = requesting_user_id()
  ) THEN
    RAISE EXCEPTION 'Non sei un partecipante di questa sessione';
  END IF;

  RETURN QUERY
  SELECT p.id AS user_id, p.display_name, p.avatar_color, p.avatar_url
  FROM consent_participants cp
  JOIN profiles p ON p.id = cp.user_id
  WHERE cp.session_id = p_session_id;
END;
$$;
