/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // No Next 14.1, essa opção fica dentro de experimental
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

export default nextConfig;