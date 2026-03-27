// Este arquivo serve como ponte de compatibilidade para código existente
// Para novos código, use importações específicas de @/lib/supabase/client

import { createBrowserClient } from '@supabase/ssr'

// Cliente singleton para uso em componentes client
let client: ReturnType<typeof createBrowserClient> | null = null

const getClient = () => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

// Exporta como supabase para compatibilidade com código existente
export const supabase = getClient()

// Também exporta como default para quem preferir
export default getClient()