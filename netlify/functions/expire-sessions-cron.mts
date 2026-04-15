import type { Config } from '@netlify/functions'

/**
 * Netlify Scheduled Function - scade automaticamente le sessioni ogni ora.
 * Chiama direttamente l'RPC `expire_stale_sessions()` via PostgREST con service role.
 *
 * Variabili d'ambiente richieste su Netlify:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
export default async function handler() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const jsonHeaders = { 'Content-Type': 'application/json' }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[expire-sessions-cron] Variabili d\'ambiente mancanti')
    return new Response('Env vars missing', { status: 500, headers: jsonHeaders })
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/expire_stale_sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
      },
    })

    const raw = await res.text()
    const parsed = raw ? (JSON.parse(raw) as number | { error?: string; message?: string }) : 0

    if (!res.ok) {
      const message =
        typeof parsed === 'object' && parsed !== null
          ? (parsed.error ?? parsed.message ?? raw)
          : raw
      console.error('[expire-sessions-cron] Errore:', message)
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: jsonHeaders,
      })
    }

    const expired = typeof parsed === 'number' ? parsed : 0
    const ranAt = new Date().toISOString()
    console.log(`[expire-sessions-cron] Sessioni scadute: ${expired} - ${ranAt}`)
    return new Response(JSON.stringify({ expired, ran_at: ranAt }), {
      status: 200,
      headers: jsonHeaders,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    console.error('[expire-sessions-cron]', message)
    return new Response(message, { status: 500, headers: jsonHeaders })
  }
}

export const config: Config = {
  schedule: '@hourly',
}
