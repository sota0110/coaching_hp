import { defineConfig } from 'vite';

export default defineConfig(({ command, isPreview }) => ({
  base: process.env.BASE_PATH || (command === 'build' || isPreview ? '/coaching_hp/' : '/'),
}));
