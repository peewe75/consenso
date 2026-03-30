DROP POLICY IF EXISTS "pairing_creator" ON public.pairing_codes;

CREATE POLICY "pairing_creator" ON public.pairing_codes
  FOR ALL
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

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
BEGIN
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

  IF v_pairing.creator_id = auth.uid() THEN
    RAISE EXCEPTION 'Non puoi usare il tuo stesso codice';
  END IF;

  v_session_id := public.create_consent_session(
    ARRAY[auth.uid(), v_pairing.creator_id],
    p_integrity_hash
  );

  UPDATE public.pairing_codes
  SET used_at = NOW()
  WHERE id = v_pairing.id
    AND used_at IS NULL;

  RETURN v_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_session_from_pairing_code(TEXT, TEXT) TO authenticated;
