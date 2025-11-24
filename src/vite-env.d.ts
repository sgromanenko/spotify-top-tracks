/// <reference types="vite/client" />

interface ImportMetaEnv {
  // CRA-style envs we want to keep
  readonly REACT_APP_SPOTIFY_CLIENT_ID?: string;
  readonly REACT_APP_SPOTIFY_CLIENT_SECRET?: string;
  readonly REACT_APP_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
