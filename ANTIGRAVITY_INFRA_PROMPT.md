# Antigravity — Configurazione infrastruttura pre-lancio APP del Consenso

Devi completare 4 task di configurazione infrastrutturale per l'app "APP del Consenso".
Hai accesso ai MCP Supabase e Netlify — usali direttamente per eseguire ogni step.

---

## TASK 1 — Applicare la migration 008 su Supabase

Usa il MCP Supabase (tool: execute_sql o apply_migration) sul progetto con ID:
  aivmwfehpjlchqkbulcy

Esegui il seguente SQL in un'unica chiamata:

```sql
-- Tabella rate limiting pairing codes
CREATE TABLE IF NOT EXISTS public.pairing_rate_limits (
  user_id       TEXT NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  attempt_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, window_start)
);

ALTER TABLE public.pairing_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limits_self" ON public.pairing_rate_limits FOR ALL USING (user_id = requesting_user_id());

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

CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.pairing_rate_limits WHERE window_start < NOW() - INTERVAL '10 minutes';
END;
$$;
```

Verifica: dopo l'esecuzione usa list_tables per confermare che la tabella
`pairing_rate_limits` esiste. Poi esegui:

```sql
SELECT public.generate_pairing_code_safe();
```

Deve restituire un codice a 6 cifre senza errori.

---

## TASK 2 — Aggiungere CLERK_SECRET_KEY ai secrets della Edge Function Supabase

La Edge Function `delete-account` richiede CLERK_SECRET_KEY per chiamare l'API
Clerk Backend e cancellare l'utente da Clerk al momento dell'eliminazione account.

Chiedi all'utente la chiave segreta Clerk prima di procedere.
Si trova in: Clerk dashboard → API Keys → Secret keys → sk_live_... (oppure sk_test_...)

Usa il MCP Supabase per impostare il secret sul progetto aivmwfehpjlchqkbulcy:
  - Nome:   CLERK_SECRET_KEY
  - Valore: [fornito dall'utente]

Se il MCP non supporta la gestione diretta dei secrets, fornisci all'utente
le istruzioni esatte:
  1. Vai su: https://supabase.com/dashboard/project/aivmwfehpjlchqkbulcy/settings/functions
  2. Sezione "Edge Function Secrets"
  3. Aggiungi: CLERK_SECRET_KEY = sk_live_...

Nota: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili automaticamente
nelle Edge Functions Supabase — non serve aggiungerli.

---

## TASK 3 — Aggiungere env vars al sito Netlify

Cerca il sito Netlify dell'app usando il MCP Netlify (netlify-project-services-reader)
— il sito ha URL che contiene "consenso".

Chiedi all'utente la SUPABASE_SERVICE_ROLE_KEY prima di procedere.
Si trova in: Supabase dashboard → Settings → API → service_role (secret, non anon).

Aggiungi le seguenti variabili d'ambiente al sito Netlify usando
netlify-project-services-updater:

  SUPABASE_URL             = https://aivmwfehpjlchqkbulcy.supabase.co
  SUPABASE_SERVICE_ROLE_KEY = [fornita dall'utente]

Queste variabili servono alla Netlify Scheduled Function
`netlify/functions/expire-sessions-cron.mts` che scade le sessioni ogni ora.

Verifica: conferma all'utente le variabili impostate correttamente.

---

## TASK 4 — Creare progetto Sentry e configurare VITE_SENTRY_DSN

Sentry non ha un MCP. Segui questi passi:

### 4a. Chiedi all'utente di creare il progetto Sentry
Istruzioni da fornire all'utente:
  1. Vai su https://sentry.io e accedi
  2. Crea un nuovo progetto: Platform = React, Nome = app-del-consenso
  3. Copia il DSN — formato: https://xxxxxxxx@oxxxxxxx.ingest.sentry.io/xxxxxxxxx
  4. Fornisci il DSN ad Antigravity per proseguire

### 4b. Aggiungere VITE_SENTRY_DSN a Netlify
Una volta ottenuto il DSN dall'utente, usa il MCP Netlify
(netlify-project-services-updater) per aggiungere al sito:

  VITE_SENTRY_DSN = [DSN fornito dall'utente]

### 4c. Aggiornare il file .env.local
Nel file locale del progetto al percorso:
  C:\Users\avvsa\OneDrive - AVVOCATO SAPONE\Desktop\Siti\APP\Consenso\.env.local

Aggiungi o aggiorna la riga:
  VITE_SENTRY_DSN=https://xxxxxxxx@oxxxxxxx.ingest.sentry.io/xxxxxxxxx

Nota: VITE_SENTRY_DSN è public by design (il DSN Sentry è pensato per il client).

---

## Ordine di esecuzione consigliato

1. Task 1 — eseguibile subito con MCP Supabase (nessun input utente richiesto)
2. Task 3 — chiedi prima la SUPABASE_SERVICE_ROLE_KEY, poi esegui con MCP Netlify
3. Task 2 — chiedi la CLERK_SECRET_KEY, poi imposta il secret Supabase
4. Task 4 — chiedi all'utente di creare il progetto Sentry e fornirti il DSN,
             poi aggiungi VITE_SENTRY_DSN a Netlify e a .env.local

---

## Verifica finale (dopo tutti i task)

Esegui su Supabase:
```sql
SELECT public.generate_pairing_code_safe();
```
Deve restituire un codice a 6 cifre — se ritorna errore di autenticazione è normale
fuori contesto utente; l'importante è che la funzione esista.

Verifica che le variabili Netlify siano tutte presenti:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - VITE_SENTRY_DSN

Conferma all'utente con un riepilogo di ogni task completato.
