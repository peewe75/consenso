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
