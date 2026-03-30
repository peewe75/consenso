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
