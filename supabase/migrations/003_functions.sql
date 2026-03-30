CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_color)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Utente'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#6366F1'));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.create_consent_session(
  p_participant_ids UUID[], p_integrity_hash TEXT DEFAULT ''
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_session_id UUID; v_uid UUID;
BEGIN
  IF NOT (auth.uid() = ANY(p_participant_ids)) THEN
    RAISE EXCEPTION 'Il chiamante deve essere un partecipante';
  END IF;
  INSERT INTO public.consent_sessions (participant_count, integrity_hash)
  VALUES (array_length(p_participant_ids, 1), p_integrity_hash) RETURNING id INTO v_session_id;
  FOREACH v_uid IN ARRAY p_participant_ids LOOP
    INSERT INTO public.consent_participants (session_id, user_id, role)
    VALUES (v_session_id, v_uid, CASE WHEN v_uid = auth.uid() THEN 'initiator' ELSE 'participant' END);
  END LOOP;
  RETURN v_session_id;
END; $$;

CREATE OR REPLACE FUNCTION public.record_consent_action(
  p_session_id UUID, p_action TEXT, p_action_hash TEXT DEFAULT ''
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_session consent_sessions%ROWTYPE;
BEGIN
  IF p_action NOT IN ('confirmed','revoked') THEN RAISE EXCEPTION 'Azione non valida'; END IF;
  SELECT * INTO v_session FROM public.consent_sessions
  WHERE id = p_session_id AND status IN ('pending','active') AND expires_at > NOW();
  IF NOT FOUND THEN RAISE EXCEPTION 'Sessione non trovata o non modificabile'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.consent_participants WHERE session_id = p_session_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Non sei un partecipante';
  END IF;
  INSERT INTO public.consent_confirmations (session_id, user_id, action, action_hash)
  VALUES (p_session_id, auth.uid(), p_action, p_action_hash);
  IF p_action = 'revoked' THEN
    UPDATE public.consent_sessions SET status='revoked', revoked_at=NOW(), revoked_by=auth.uid() WHERE id=p_session_id;
  ELSIF p_action = 'confirmed' THEN
    UPDATE public.consent_sessions SET status='active' WHERE id=p_session_id AND status='pending';
    IF (SELECT COUNT(DISTINCT user_id) FROM public.v_current_consent_status
        WHERE session_id=p_session_id AND current_status='confirmed') >= v_session.participant_count THEN
      UPDATE public.consent_sessions SET status='confirmed', confirmed_at=NOW() WHERE id=p_session_id;
    END IF;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.expire_stale_sessions()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE expired_count INT;
BEGIN
  UPDATE public.consent_sessions SET status='expired'
  WHERE status IN ('pending','active') AND expires_at < NOW();
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END; $$;

CREATE OR REPLACE FUNCTION public.generate_pairing_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE v_code TEXT; v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.pairing_codes WHERE code=v_code AND used_at IS NULL AND expires_at > NOW()) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END; $$;

CREATE OR REPLACE FUNCTION public.get_session_profiles(p_session_id UUID)
RETURNS TABLE (user_id UUID, display_name TEXT, avatar_color TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.consent_participants
    WHERE session_id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Non autorizzato';
  END IF;

  RETURN QUERY
  SELECT cp.user_id, p.display_name, p.avatar_color
  FROM public.consent_participants cp
  JOIN public.profiles p ON p.id = cp.user_id
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
  IF NOT EXISTS (
    SELECT 1 FROM public.consent_participants
    WHERE session_id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Non autorizzato';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE vcs.current_status = 'confirmed')::INT AS confirmed_count,
    COALESCE(BOOL_OR(vcs.current_status = 'revoked'), FALSE) AS any_revoked
  FROM public.v_current_consent_status vcs
  WHERE vcs.session_id = p_session_id;
END;
$$;
