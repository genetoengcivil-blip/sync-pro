/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isso ajuda a evitar erros de compilação com o Supabase no lado do servidor
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;