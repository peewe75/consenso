import type { Config } from '@netlify/functions'

/**
 * Netlify Scheduled Function — scade automaticamente le sessioni ogni ora.
 * Chiama la Supabase Edge Function `expire-sessions` che esegue `expire_stale_sessions()`.
 *
 * Variabili d'ambiente richieste su Netlify:
 *   SUPABASE_URL             (es. https://xxxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY (dalla dashboard Supabase → Settings → API)
 */
export default async function handler() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[expire-sessions-cron] Variabili d\'ambiente mancanti')
    return { statusCode: 500, body: 'Env vars missing' }
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/expire-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    })

    const body = await res.json() as { expired?: number; ran_at?: string; error?: string }

    if (!res.ok) {
      console.error('[expire-sessions-cron] Errore:', body.error)
      return { statusCode: 500, body: JSON.stringify(body) }
    }

    console.log(`[expire-sessions-cron] Sessioni scadute: ${body.expired ?? 0} — ${body.ran_at ?? new Date().toISOString()}`)
    return { statusCode: 200, body: JSON.stringify(body) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    console.error('[expire-sessions-cron]', message)
    return { statusCode: 500, body: message }
  }
}

export const config: Config = {
  schedule: '@hourly',
}
