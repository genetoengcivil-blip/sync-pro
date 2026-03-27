import { createBrowserClient } from '@supabase/ssr'

// Singleton para o cliente do navegador
let client: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

// Exportação direta
const supabase = createClient()
export default supabase