import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Criamos uma única instância do cliente para ser exportada e usada em todo o app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);