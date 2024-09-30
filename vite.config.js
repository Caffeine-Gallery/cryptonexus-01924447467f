import { defineConfig } from 'vite';
import { vitePluginEnvironment } from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    vitePluginEnvironment({
      VITE_COMMENTS_CANISTER_ID: process.env.COMMENTS_CANISTER_ID,
    }),
  ],
  // other Vite configurations...
});
