# APP del Consenso

Progressive Web App mobile-first per documentare il consenso reciproco tra adulti con pairing di prossimita, conferma condivisa, revoca immediata e storico personale.

## Stack

- React 18 + TypeScript + Vite 8
- Tailwind CSS v4
- Supabase Auth + PostgreSQL + Realtime + Edge Functions
- Capacitor per packaging Android e iOS
- vite-plugin-pwa + Workbox

## Avvio locale

```bash
npm install
npm run dev
```

Build produzione:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Variabili ambiente

Crea `.env.local` partendo da `.env.example`.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANDROID_APK_URL=
VITE_GOOGLE_PLAY_URL=
VITE_APP_STORE_URL=
```

Le tre variabili download sono opzionali:

- `VITE_ANDROID_APK_URL`: link diretto al file APK
- `VITE_GOOGLE_PLAY_URL`: URL pubblico della scheda Google Play
- `VITE_APP_STORE_URL`: URL pubblico della scheda App Store

Se lasciate vuote, la landing mostra i pulsanti come non ancora pubblicati.

## Supabase

Le migration si trovano in:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_functions.sql`

Edge Function schedulabile:

- `supabase/functions/expire-sessions/index.ts`

## Deploy con GitHub e Netlify

### GitHub

```bash
git init -b main
git remote add origin https://github.com/peewe75/consenso.git
git add .
git commit -m "Initial app setup"
git push -u origin main
```

### Netlify

Il progetto include `netlify.toml` con:

- build command: `npm run build`
- publish directory: `dist`
- redirect SPA da `/*` a `/index.html`

Flusso consigliato:

1. collega la repo GitHub a Netlify
2. imposta in Netlify le stesse env vars usate in locale
3. avvia il primo deploy production

## Routing pubblico

- `/` landing pubblica e pagina download/installazione
- `/register` registrazione
- `/login` accesso
- `/app` area autenticata

## Note

- La PWA e installabile da smartphone gia ora.
- I link APK, Google Play e App Store vengono attivati automaticamente quando imposti le relative env vars.
