import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  site: 'https://cursed3.netlify.app',
  integrations: [tailwind()]
});
