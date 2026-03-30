CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL,
  avatar_color  TEXT NOT NULL DEFAULT '#6366F1',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT display_name_length CHECK (char_length(display_name) BETWEEN 2 AND 30)
);

CREATE TABLE public.pairing_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code        TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT code_format CHECK (code ~ '^\d{6}$')
);

CREATE TABLE public.consent_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','active','confirmed','revoked','expired')),
  initiated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ,
  revoked_at        TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 hours'),
  revoked_by        UUID REFERENCES public.profiles(id),
  integrity_hash    TEXT NOT NULL DEFAULT '',
  participant_count INT NOT NULL DEFAULT 2,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.consent_participants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.consent_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role        TEXT NOT NULL DEFAULT 'participant'
              CHECK (role IN ('initiator','participant')),
  UNIQUE(session_id, user_id)
);

CREATE TABLE public.consent_confirmations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES public.consent_sessions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action       TEXT NOT NULL CHECK (action IN ('confirmed','revoked')),
  actioned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_hash  TEXT NOT NULL DEFAULT ''
);

CREATE VIEW public.v_current_consent_status AS
SELECT DISTINCT ON (session_id, user_id)
  session_id, user_id,
  action      AS current_status,
  actioned_at AS last_action_at
FROM public.consent_confirmations
ORDER BY session_id, user_id, actioned_at DESC;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "pairing_creator" ON public.pairing_codes FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "pairing_read_valid" ON public.pairing_codes
  FOR SELECT USING (used_at IS NULL AND expires_at > NOW());

CREATE POLICY "sessions_participants_only" ON public.consent_sessions
  FOR ALL USING (id IN (SELECT session_id FROM public.consent_participants WHERE user_id = auth.uid()));

CREATE POLICY "participants_same_session" ON public.consent_participants
  FOR SELECT USING (session_id IN (SELECT session_id FROM public.consent_participants WHERE user_id = auth.uid()));

CREATE POLICY "participants_insert_self" ON public.consent_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "confirmations_self_read" ON public.consent_confirmations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "confirmations_insert_self" ON public.consent_confirmations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.consent_participants cp
      JOIN public.consent_sessions cs ON cs.id = cp.session_id
      WHERE cp.user_id = auth.uid()
        AND cp.session_id = consent_confirmations.session_id
        AND cs.status IN ('pending','active')
        AND cs.expires_at > NOW()
    )
  );


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

