-- Tabella per tracking tentativi di generazione codici pairing per utente
CREATE TABLE IF NOT EXISTS public.pairing_rate_limits (
  user_id       TEXT NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  attempt_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, window_start)
);

-- RLS: ogni utente vede solo il proprio contatore
ALTER TABLE public.pairing_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limits_self" ON public.pairing_rate_limits FOR ALL USING (user_id = requesting_user_id());

-- Funzione con rate limiting integrato (max 5 generazioni per minuto per utente)
CREATE OR REPLACE FUNCTION public.generate_pairing_code_safe()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid        TEXT := requesting_user_id();
  v_window     TIMESTAMPTZ := date_trunc('minute', NOW());
  v_count      INT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Non autenticato';
  END IF;

  INSERT INTO public.pairing_rate_limits (user_id, window_start, attempt_count)
  VALUES (v_uid, v_window, 1)
  ON CONFLICT (user_id, window_start)
  DO UPDATE SET attempt_count = pairing_rate_limits.attempt_count + 1
  RETURNING attempt_count INTO v_count;

  IF v_count > 5 THEN
    RAISE EXCEPTION 'Troppi tentativi. Attendi un minuto prima di generare un nuovo codice.';
  END IF;

  RETURN generate_pairing_code();
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_pairing_code_safe() TO authenticated;

-- Pulizia automatica dei record di rate limiting più vecchi di 10 minuti
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.pairing_rate_limits
  WHERE window_start < NOW() - INTERVAL '10 minutes';
END;
$$;
