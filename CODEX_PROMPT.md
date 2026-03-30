# CODEX PROMPT — APP del Consenso

## OBIETTIVO

Crea da zero una Progressive Web App (PWA) chiamata **"APP del Consenso"** che permetta a due o più adulti di documentare reciprocamente il proprio consenso consapevole. L'app deve essere installabile su Android (Google Play + APK diretto) e iOS (App Store) tramite Capacitor, e distribuibile anche come sito web su Hostinger.

---

## STACK TECNOLOGICO (obbligatorio, non modificare)

```
Frontend:     React 18 + TypeScript + Vite 8
PWA:          vite-plugin-pwa + Workbox
App nativa:   @capacitor/core + @capacitor/cli
Backend/Auth: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
Styling:      Tailwind CSS v4 + @tailwindcss/vite (NO config file, solo CSS)
State:        Zustand
Routing:      React Router v6
Animazioni:   Framer Motion
QR Code:      qrcode.react (generazione) + html5-qrcode (scansione)
Utilità:      clsx + tailwind-merge + date-fns + lucide-react + zod
Crypto:       Web Crypto API nativa (NO librerie esterne per hashing)
```

---

## FUNZIONALITÀ RICHIESTE

### 1. Autenticazione
- Registrazione con email + password via Supabase Auth
- Step 2 registrazione: scegli pseudonimo (display_name, 2-30 chars) e colore avatar
- Login con email + password
- Il trigger `handle_new_user()` su `auth.users` crea automaticamente il profilo in `public.profiles`
- AuthGuard: redirect a `/login` se non autenticato

### 2. Pairing di prossimità (i due utenti sono fisicamente insieme)
- **Metodo A — Mostra QR**: genera un QR Code (JSON payload: `{c: code6cifre, u: userId, n: displayName, a: avatarColor}`) con scadenza 10 minuti e progress bar countdown. Codice a 6 cifre sotto il QR come fallback visivo.
- **Metodo B — Scansiona QR**: attiva la fotocamera con `html5-qrcode`, parsea il payload, mostra il profilo del partner trovato, chiede conferma prima di procedere.
- **Metodo C — Inserisci codice**: 6 input separati (un digit per box), focus automatico al box successivo, supporto backspace.
- Dopo il pairing: chiama la DB function `create_consent_session(participant_ids[], integrity_hash)` e naviga a `/session/:id`.

### 3. Sessione di Consenso
- **Timer 5 ore**: countdown `HH:MM:SS`, cambia colore: verde → giallo (ultimi 30 min) → rosso (scaduto)
- **Lista partecipanti**: mostra avatar + nome + stato. Per gli altri partecipanti NON mostrare il loro stato individuale (privacy). Mostra solo stato aggregato: "X/Y hanno confermato".
- **ConsentButton (press-and-hold 600ms)**:
  - SVG progress ring animato attorno al pulsante durante il press
  - `onPointerDown` avvia l'intervallo, `onPointerUp`/`onPointerLeave` resetta
  - `navigator.vibrate([10])` all'inizio, `navigator.vibrate([50])` al completamento
  - Due modalità: `confirm` (indigo, ShieldCheck) e `revoke` (rosso, ShieldOff)
- **Revoca**: sempre disponibile finché la sessione è attiva. Apre un bottom sheet di conferma prima di eseguire. Usa `ConsentButton mode="revoke"` nel dialog.
- **Realtime**: subscrive a `consent_sessions` e `consent_confirmations` via Supabase Realtime. Aggiorna stato senza refresh manuale.
- **Scadenza automatica**: Edge Function `expire-sessions` che chiama `expire_stale_sessions()` periodicamente.

### 4. Storico
- Lista sessioni filtrabili per stato: Tutte | Confermate | Revocate | Scadute
- Per ogni sessione: data/ora, badge stato colorato, link a dettaglio
- Privacy: mostra solo il proprio stato, non quello degli altri partecipanti

### 5. Profilo / Impostazioni
- Avatar con iniziale + colore scelto alla registrazione
- Logout
- Placeholder "Elimina account" (GDPR)

---

## SCHEMA DATABASE SUPABASE (migrations obbligatorie)

### `001_initial_schema.sql`

```sql
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
```

### `002_rls_policies.sql`

```sql
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_codes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_confirmations ENABLE ROW LEVEL SECURITY;

-- Ogni utente vede e modifica solo il proprio profilo
CREATE POLICY "profiles_self" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Il creatore gestisce i propri codici
CREATE POLICY "pairing_creator" ON public.pairing_codes FOR ALL USING (auth.uid() = creator_id);

-- Chiunque può leggere un codice valido (per fare join)
CREATE POLICY "pairing_read_valid" ON public.pairing_codes
  FOR SELECT USING (used_at IS NULL AND expires_at > NOW());

-- Sessioni visibili solo ai partecipanti
CREATE POLICY "sessions_participants_only" ON public.consent_sessions
  FOR ALL USING (id IN (SELECT session_id FROM public.consent_participants WHERE user_id = auth.uid()));

-- Partecipanti della stessa sessione si vedono tra loro
CREATE POLICY "participants_same_session" ON public.consent_participants
  FOR SELECT USING (session_id IN (SELECT session_id FROM public.consent_participants WHERE user_id = auth.uid()));

CREATE POLICY "participants_insert_self" ON public.consent_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Ogni utente vede SOLO le proprie azioni (privacy)
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
```

### `003_functions.sql`

```sql
-- Crea profilo automaticamente alla registrazione
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

-- Crea sessione + partecipanti in transazione atomica
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

-- Registra azione consenso (confirm/revoke) con logica di stato
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

-- Scade sessioni oltre 5 ore
CREATE OR REPLACE FUNCTION public.expire_stale_sessions()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE expired_count INT;
BEGIN
  UPDATE public.consent_sessions SET status='expired'
  WHERE status IN ('pending','active') AND expires_at < NOW();
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END; $$;

-- Genera codice pairing univoco a 6 cifre
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
```

---

## DESIGN SYSTEM (obbligatorio)

```
Tema:              Dark mode sempre attivo
Background:        #0F0F14
Surface card:      #1A1A24
Surface card 2:    #22223A
Bordi:             #2D2D42
Accent primario:   #6366F1  (indigo — fiducia)
Success:           #10B981  (emerald — consenso attivo)
Warning:           #F59E0B  (amber — in scadenza)
Danger:            #EF4444  (rosso — revoca)
Testo primario:    #F8FAFC
Testo secondario:  #94A3B8
Testo muted:       #475569
Font:              Inter (Google Fonts, subset latin, weight 400/500/700)
Border radius:     8px (sm) / 12px (md) / 16px (lg) / 24px (xl) / 9999px (full)
```

**Regole UX:**
- Azioni distruttive (conferma/revoca) richiedono **press-and-hold 600ms**, NON semplice tap
- Ogni bottone ha `active:scale-[0.98]` o `active:opacity-80` per feedback touch
- `-webkit-tap-highlight-color: transparent` su tutto
- `overscroll-behavior: none` sul body
- Safe area iOS con `env(safe-area-inset-*)` su tutti i layout
- `viewport-fit=cover` nel meta viewport

---

## STRUTTURA CARTELLE

```
src/
├── components/
│   ├── auth/AuthGuard.tsx
│   ├── layout/AppShell.tsx
│   ├── layout/BottomNav.tsx       (Home, Storico, Profilo)
│   └── session/ConsentButton.tsx  (press-and-hold con SVG progress ring)
├── hooks/
│   ├── useAuth.ts                 (useAuthInit + useAuth)
│   ├── useSession.ts              (loadSession, confirmConsent, revokeConsent)
│   ├── useRealtime.ts             (Supabase Realtime subscription)
│   └── useTimer.ts                (countdown da expires_at)
├── lib/
│   ├── supabase.ts                (createClient con Database type)
│   ├── crypto.ts                  (sha256 via Web Crypto API, buildActionHash, buildIntegrityHash)
│   └── utils.ts                   (cn, formatCountdown, isExpiringSoon, generateAvatarColor)
├── pages/
│   ├── auth/WelcomePage.tsx
│   ├── auth/LoginPage.tsx
│   ├── auth/RegisterPage.tsx      (2 step: email+pwd → pseudonimo+colore)
│   ├── home/HomePage.tsx
│   ├── pairing/PairingPage.tsx    (hub con 3 opzioni)
│   ├── pairing/ShowQRPage.tsx
│   ├── pairing/ScanQRPage.tsx
│   ├── pairing/EnterCodePage.tsx  (6 digit boxes)
│   ├── session/SessionPage.tsx
│   ├── history/HistoryPage.tsx
│   └── settings/SettingsPage.tsx
├── stores/
│   ├── authStore.ts               (Zustand: user, session, profile, loading)
│   └── sessionStore.ts            (Zustand: currentSession, pairedUser)
├── types/
│   ├── database.ts                (Database interface per Supabase typed client)
│   └── session.ts                 (SessionWithParticipants, ParticipantWithProfile)
├── styles/globals.css             (Tailwind v4 @import + @theme + animazioni)
├── App.tsx
├── main.tsx
└── router.tsx
supabase/migrations/
├── 001_initial_schema.sql
├── 002_rls_policies.sql
└── 003_functions.sql
capacitor.config.ts                (appId: "it.consenso.app")
vite.config.ts                     (react + tailwindcss + VitePWA)
index.html                         (meta apple-mobile-web-app-capable, viewport-fit=cover)
.env.local                         (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
```

---

## VARIABILI D'AMBIENTE

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## CONFIGURAZIONE CAPACITOR

```typescript
// capacitor.config.ts
{
  appId: 'it.consenso.app',
  appName: 'APP del Consenso',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: {
    PushNotifications: { presentationOptions: ['badge','sound','alert'] },
    StatusBar: { style: 'dark', backgroundColor: '#0F0F14' }
  }
}
```

Plugin Capacitor da installare:
- `@capacitor/camera` — scanner QR nativo su mobile
- `@capacitor/push-notifications` — notifiche native
- `@capacitor/haptics` — feedback aptico
- `@capacitor/status-bar` — status bar scura

---

## DETTAGLI IMPLEMENTATIVI CHIAVE

### ConsentButton (press-and-hold)
```
- SVG circle con stroke-dasharray/stroke-dashoffset per animare il progress ring
- raggio SVG = 44px, circumference = 2π×44
- intervallo 16ms (≈60fps) per aggiornare il progresso
- onPointerDown avvia, onPointerUp/onPointerLeave cancella
- al 100% → chiama onAction(), vibra [50ms], resetta progress
- disabled durante acting (loading)
```

### Hash integrità (Web Crypto API)
```typescript
async function sha256(data: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2,'0')).join('')
}
// action_hash = sha256(sessionId + '|' + userId + '|' + action + '|' + timestamp)
// integrity_hash = sha256(sortedParticipantIds.join('|') + '|' + initiatedAt)
```

### Realtime subscription
```typescript
supabase.channel(`session:${sessionId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'consent_sessions', filter: `id=eq.${sessionId}` }, onUpdate)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'consent_confirmations', filter: `session_id=eq.${sessionId}` }, onUpdate)
  .subscribe()
```

### Tailwind CSS v4 (no tailwind.config.js)
```css
/* src/styles/globals.css */
@import "tailwindcss";
@theme {
  --color-background: #0F0F14;
  --color-accent: #6366F1;
  /* ... altre variabili ... */
}
```
```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
plugins: [react(), tailwindcss(), VitePWA(...)]
```

---

## FLUSSO COMPLETO (per test manuale)

```
1. /welcome  → CTA "Inizia ora"
2. /register → Step1: email+pwd → Step2: pseudonimo+colore avatar → signup Supabase
3. /         → HomePage: vedi "Nuovo Consenso"
4. /pairing  → Scegli "Mostra il mio QR"
5. Su un secondo dispositivo: /pairing → "Scansiona QR" → scan → conferma → sessione creata
6. /session/:id → entrambi premono ConsentButton 600ms → stato diventa "Confermato"
7. Uno preme "Revoca" → 600ms hold → sessione diventa "Revocata" → notifica realtime all'altro
8. /history  → lista con badge stato
```

---

## COMANDI DI SVILUPPO

```bash
# Installa
npm install

# Dev server
npm run dev

# Build produzione (per Hostinger)
npm run build
# → dist/ pronto per upload su public_html/ via FTP

# Build Android APK (test su Huawei P30 Pro)
npm run build && npx cap sync android
# Aprire Android Studio → Build → Generate Signed APK

# Build iOS
npm run build && npx cap sync ios
# Aprire Xcode → Product → Archive
```

---

## NOTE IMPORTANTI

1. **Privacy by design**: non raccogliere email visibili, audio, documenti d'identità. Solo pseudonimo.
2. **Nessun valore legale**: l'app ha valore documentale/comunicativo, non probatorio. Inserire disclaimer nell'onboarding.
3. **RLS obbligatoria**: verificare sempre che le policy impediscano accesso a dati altrui.
4. **iOS Safari**: il Service Worker funziona solo in modalità standalone (installata). Mostrare istruzioni "Aggiungi a schermata Home" su iOS.
5. **Huawei P30 Pro (HMS)**: per test APK, le push notifications native richiedono configurazione Firebase Cloud Messaging aggiuntiva. In alternativa usare le notifiche web via Supabase.
6. **Store**: la distribuzione via PWA (Hostinger) evita le politiche degli store su contenuti "mature". Per Google Play/App Store usare un nome e descrizione neutri.
