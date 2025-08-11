/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CRYPTO_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}