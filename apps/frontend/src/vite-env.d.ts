/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly FE_VITE_API_URL: string;
  readonly FE_VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __ENV__?: {
    FE_VITE_API_URL?: string;
    FE_VITE_SENTRY_DSN?: string;
  };
}

declare const __APP_VERSION__: string;
