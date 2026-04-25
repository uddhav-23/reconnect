/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_INSTITUTIONAL_EMAIL_DOMAINS?: string;
  /** If set, must match firestore.rules isPlatformOwner email (default uddhavjoshi24@gmail.com). */
  readonly VITE_PLATFORM_OWNER_EMAIL?: string;
  readonly VITE_ALGOLIA_APP_ID?: string;
  readonly VITE_ALGOLIA_SEARCH_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
