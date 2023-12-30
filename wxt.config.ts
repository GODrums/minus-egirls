import { defineConfig } from 'wxt';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'MinusEgirls',
    description: 'My extension description',
    version: '1.0.0',
    host_permissions: ["*://*.twitter.com/*"],
    "permissions": ["storage"],
    web_accessible_resources: [{
      resources: ["inject.js"],
      matches: ["*://*.twitter.com/*"]
    }],
  },
  vite: () => ({
    plugins: [
      svelte({
        // Using a svelte.config.js file causes a segmentation fault when importing the file
        configFile: false,
        preprocess: [vitePreprocess()],
      }),
    ],
  }),
});
