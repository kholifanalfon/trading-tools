/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly FE_VITE_API_URL: string;
  readonly FE_VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
