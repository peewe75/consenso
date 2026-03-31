DROP VIEW IF EXISTS public.v_current_consent_status;

DROP POLICY IF EXISTS "profiles_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "pairing_creator" ON public.pairing_codes;
DROP POLICY IF EXISTS "pairing_read_valid" ON public.pairing_codes;
DROP POLICY IF EXISTS "sessions_participants_only" ON public.consent_sessions;
DROP POLICY IF EXISTS "participants_same_session" ON public.consent_participants;
DROP POLICY IF EXISTS "participants_insert_self" ON public.consent_participants;
DROP POLICY IF EXISTS "confirmations_self_read" ON public.consent_confirmations;
DROP POLICY IF EXISTS "confirmations_insert_self" ON public.consent_confirmations;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.pairing_codes DROP CONSTRAINT IF EXISTS pairing_codes_creator_id_fkey;
ALTER TABLE public.consent_sessions DROP CONSTRAINT IF EXISTS consent_sessions_revoked_by_fkey;
ALTER TABLE public.consent_participants DROP CONSTRAINT IF EXISTS consent_participants_user_id_fkey;
ALTER TABLE public.consent_confirmations DROP CONSTRAINT IF EXISTS consent_confirmations_user_id_fkey;

ALTER TABLE public.profiles
  ALTER COLUMN id TYPE TEXT USING id::TEXT;

ALTER TABLE public.pairing_codes
  ALTER COLUMN creator_id TYPE TEXT USING creator_id::TEXT;

ALTER TABLE public.consent_sessions
  ALTER COLUMN revoked_by TYPE TEXT USING revoked_by::TEXT;

ALTER TABLE public.consent_participants
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE public.consent_confirmations
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE public.pairing_codes
  ADD CONSTRAINT pairing_codes_creator_id_fkey
  FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.consent_sessions
  ADD CONSTRAINT consent_sessions_revoked_by_fkey
  FOREIGN KEY (revoked_by) REFERENCES public.profiles(id);

ALTER TABLE public.consent_participants
  ADD CONSTRAINT consent_participants_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.consent_confirmations
  ADD CONSTRAINT consent_confirmations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt()->>'sub', auth.jwt()->>'user_id');
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_participant(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.consent_participants
    WHERE session_id = p_session_id
      AND user_id = public.requesting_user_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_insert_confirmation(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.consent_sessions
    WHERE id = p_session_id
      AND status IN ('pending', 'active')
      AND expires_at > NOW()
      AND public.is_current_user_participant(id)
  );
$$;

DROP FUNCTION IF EXISTS public.create_consent_session(UUID[], TEXT);
CREATE OR REPLACE FUNCTION public.create_consent_session(
  p_participant_ids TEXT[],
  p_integrity_hash TEXT DEFAULT ''
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_uid TEXT;
  v_requesting_user TEXT := public.requesting_user_id();
BEGIN
  IF v_requesting_user IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  IF NOT (v_requesting_user = ANY(p_participant_ids)) THEN
    RAISE EXCEPTION 'Il chiamante deve essere un partecipante';
  END IF;

  INSERT INTO public.consent_sessions (participant_count, integrity_hash)
  VALUES (array_length(p_participant_ids, 1), p_integrity_hash)
  RETURNING id INTO v_session_id;

  FOREACH v_uid IN ARRAY p_participant_ids LOOP
    INSERT INTO public.consent_participants (session_id, user_id, role)
    VALUES (
      v_session_id,
      v_uid,
      CASE WHEN v_uid = v_requesting_user THEN 'initiator' ELSE 'participant' END
    );
  END LOOP;

  RETURN v_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_consent_action(
  p_session_id UUID,
  p_action TEXT,
  p_action_hash TEXT DEFAULT ''
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.consent_sessions%ROWTYPE;
  v_requesting_user TEXT := public.requesting_user_id();
BEGIN
  IF p_action NOT IN ('confirmed', 'revoked') THEN
    RAISE EXCEPTION 'Azione non valida';
  END IF;

  IF v_requesting_user IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  SELECT *
  INTO v_session
  FROM public.consent_sessions
  WHERE id = p_session_id
    AND status IN ('pending', 'active')
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sessione non trovata o non modificabile';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.consent_participants
    WHERE session_id = p_session_id
      AND user_id = v_requesting_user
  ) THEN
    RAISE EXCEPTION 'Non sei un partecipante';
  END IF;

  INSERT INTO public.consent_confirmations (session_id, user_id, action, action_hash)
  VALUES (p_session_id, v_requesting_user, p_action, p_action_hash);

  IF p_action = 'revoked' THEN
    UPDATE public.consent_sessions
    SET status = 'revoked', revoked_at = NOW(), revoked_by = v_requesting_user
    WHERE id = p_session_id;
  ELSIF p_action = 'confirmed' THEN
    UPDATE public.consent_sessions
    SET status = 'active'
    WHERE id = p_session_id
      AND status = 'pending';

    IF (
      SELECT COUNT(DISTINCT user_id)
      FROM public.v_current_consent_status
      WHERE session_id = p_session_id
        AND current_status = 'confirmed'
    ) >= v_session.participant_count THEN
      UPDATE public.consent_sessions
      SET status = 'confirmed', confirmed_at = NOW()
      WHERE id = p_session_id;
    END IF;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS public.get_session_profiles(UUID);
CREATE OR REPLACE FUNCTION public.get_session_profiles(p_session_id UUID)
RETURNS TABLE (user_id TEXT, display_name TEXT, avatar_color TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_participant(p_session_id) THEN
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

CREATE OR REPLACE FUNCTION public.get_session_metrics(p_session_id UUID)
RETURNS TABLE (confirmed_count INT, any_revoked BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_participant(p_session_id) THEN
    RAISE EXCEPTION 'Non autorizzato';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE vcs.current_status = 'confirmed')::INT AS confirmed_count,
    COALESCE(BOOL_OR(vcs.current_status = 'revoked'), FALSE) AS any_revoked
  FROM public.v_current_consent_status AS vcs
  WHERE vcs.session_id = p_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_session_from_pairing_code(
  p_code TEXT,
  p_integrity_hash TEXT DEFAULT ''
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pairing public.pairing_codes%ROWTYPE;
  v_session_id UUID;
  v_requesting_user TEXT := public.requesting_user_id();
BEGIN
  IF v_requesting_user IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  SELECT *
  INTO v_pairing
  FROM public.pairing_codes
  WHERE code = p_code
    AND used_at IS NULL
    AND expires_at > NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Codice non valido o scaduto';
  END IF;

  IF v_pairing.creator_id = v_requesting_user THEN
    RAISE EXCEPTION 'Non puoi usare il tuo stesso codice';
  END IF;

  v_session_id := public.create_consent_session(
    ARRAY[v_requesting_user, v_pairing.creator_id],
    p_integrity_hash
  );

  UPDATE public.pairing_codes
  SET used_at = NOW()
  WHERE id = v_pairing.id
    AND used_at IS NULL;

  RETURN v_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_my_profile(
  p_display_name TEXT,
  p_avatar_color TEXT
) RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requesting_user TEXT := public.requesting_user_id();
  v_profile public.profiles;
BEGIN
  IF v_requesting_user IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  INSERT INTO public.profiles (id, display_name, avatar_color)
  VALUES (v_requesting_user, p_display_name, p_avatar_color)
  ON CONFLICT (id) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    avatar_color = EXCLUDED.avatar_color,
    updated_at = NOW()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

CREATE VIEW public.v_current_consent_status AS
SELECT DISTINCT ON (session_id, user_id)
  session_id,
  user_id,
  action AS current_status,
  actioned_at AS last_action_at
FROM public.consent_confirmations
ORDER BY session_id, user_id, actioned_at DESC;

CREATE POLICY "profiles_self" ON public.profiles
  FOR SELECT USING (public.requesting_user_id() = id);

CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (public.requesting_user_id() = id);

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE
  USING (public.requesting_user_id() = id)
  WITH CHECK (public.requesting_user_id() = id);

CREATE POLICY "pairing_creator" ON public.pairing_codes
  FOR ALL
  USING (public.requesting_user_id() = creator_id)
  WITH CHECK (public.requesting_user_id() = creator_id);

CREATE POLICY "pairing_read_valid" ON public.pairing_codes
  FOR SELECT USING (used_at IS NULL AND expires_at > NOW());

CREATE POLICY "sessions_participants_only" ON public.consent_sessions
  FOR ALL USING (public.is_current_user_participant(id));

CREATE POLICY "participants_same_session" ON public.consent_participants
  FOR SELECT USING (public.is_current_user_participant(session_id));

CREATE POLICY "participants_insert_self" ON public.consent_participants
  FOR INSERT WITH CHECK (public.requesting_user_id() = user_id);

CREATE POLICY "confirmations_self_read" ON public.consent_confirmations
  FOR SELECT USING (public.requesting_user_id() = user_id);

CREATE POLICY "confirmations_insert_self" ON public.consent_confirmations
  FOR INSERT WITH CHECK (
    public.requesting_user_id() = user_id
    AND public.can_insert_confirmation(session_id)
  );

GRANT EXECUTE ON FUNCTION public.create_consent_session(TEXT[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_session_from_pairing_code(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_consent_action(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_session_profiles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_session_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_my_profile(TEXT, TEXT) TO authenticated;
