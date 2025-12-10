/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  
  // Build Configuration
  readonly VITE_BASE_PATH?: string
  
  // Note: BASE_URL, MODE, DEV, PROD, SSR are provided by vite/client types
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
