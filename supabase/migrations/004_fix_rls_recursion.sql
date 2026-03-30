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
      AND user_id = auth.uid()
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

DROP POLICY IF EXISTS "sessions_participants_only" ON public.consent_sessions;
CREATE POLICY "sessions_participants_only" ON public.consent_sessions
  FOR ALL USING (public.is_current_user_participant(id));

DROP POLICY IF EXISTS "participants_same_session" ON public.consent_participants;
CREATE POLICY "participants_same_session" ON public.consent_participants
  FOR SELECT USING (public.is_current_user_participant(session_id));

DROP POLICY IF EXISTS "confirmations_insert_self" ON public.consent_confirmations;
CREATE POLICY "confirmations_insert_self" ON public.consent_confirmations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.can_insert_confirmation(session_id)
  );
