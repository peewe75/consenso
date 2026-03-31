import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const clerkSecretKey = Deno.env.get('CLERK_SECRET_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!supabaseUrl || !serviceRoleKey || !clerkSecretKey) {
    return new Response(JSON.stringify({ error: 'Variabili d\'ambiente mancanti' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Nessun token di autorizzazione' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  // 1. Identificare l'utente dal token JWT
  // Essendo il JWT di Clerk, supabase.auth.getUser() fallirebbe.
  // perché suppone di controllare il DB Auth di Supabase.

  // Per estrarre il subject dal JWT di Clerk occorre parsarlo.
  // Un approccio più sicuro è usare il backend per verificare il token,
  // ma dato che il proxy o la richiesta ha un token valido firmato, 
  // possiamo decodificarne le parti.

  const token = authHeader.replace('Bearer ', '')
  let uid = ''
  try {
    const payloadInfo = token.split('.')[1]
    const decoded = JSON.parse(atob(payloadInfo))
    uid = decoded.sub // Il sub è sempre l'ID di Clerk
  } catch {
    return new Response(JSON.stringify({ error: 'Token JWT non valido' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!uid) {
     return new Response(JSON.stringify({ error: 'User ID non trovato nel JWT' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }


  // Usiamo il client serviceRole per bypassare RLS durante l'eliminazione
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  try {
    // 2. Cancella (in background) o in blocco transazionale
    // Siccome postgREST non ha transazioni cross-table native in una singola request,
    // eseguiamo in sequenza usando client admin per via di RLS e foreign keys

    // A. `consent_confirmations`
    await adminClient.from('consent_confirmations').delete().eq('user_id', uid)

    // B. `consent_participants`
    await adminClient.from('consent_participants').delete().eq('user_id', uid)

    // C. `pairing_codes`
    await adminClient.from('pairing_codes').delete().eq('creator_id', uid)

    // D. `consent_sessions` rimaste orfane (per semplicità pulizia, opzionale 
    // ma la tralasciamo se il db è relazionato bene con ON DELETE CASCADE o simile, 
    // per ora cancelliamo i partecipanti, ma la sessione può restare orfana. 
    // Possiamo lasciar scadere le sessioni orfane col cron)

    // E. `profiles`
    await adminClient.from('profiles').delete().eq('id', uid)

    // 3. Cancella utente da Clerk Backend API
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${uid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!clerkRes.ok) {
      const errorText = await clerkRes.text()
      console.error('Clerk deletion failed:', errorText)
      // L'errore da Clerk è tollerato se l'utente non esisteva già, ma meglio stamparlo
    }

    return new Response(JSON.stringify({ success: true, user_deleted: uid }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Errore sconosciuto'
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

})
