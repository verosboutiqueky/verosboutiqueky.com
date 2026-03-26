// @ts-check
import { defineConfig } from 'astro/config';
import editableRegions from '@cloudcannon/editable-regions/astro-integration';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [editableRegions()],
});
