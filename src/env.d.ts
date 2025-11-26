/// <reference types="vite/client" />

// Add any custom Vite environment variables here so TypeScript recognizes them
interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
