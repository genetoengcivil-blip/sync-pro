// Este arquivo exporta apenas o cliente para componentes client
// Para server components, use @/lib/supabase/server
import supabase from './client'
export default supabase

// Exporta também para quem precisa do tipo
export type { SupabaseClient } from '@supabase/supabase-js'