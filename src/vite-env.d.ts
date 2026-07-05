/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // ممكن تضيف إعدادات أخرى هنا
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
