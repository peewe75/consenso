import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

Deno.serve(async () => {
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Supabase env mancanti' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data, error } = await supabase.rpc('expire_stale_sessions')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ expired: data ?? 0, ran_at: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
