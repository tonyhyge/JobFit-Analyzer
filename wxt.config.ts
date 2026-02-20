import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    srcDir: 'src',
    outDir: 'dist',
    manifest: {
        name: 'JobFit Analyzer',
        description: 'Score your LinkedIn profile against 2026 tech niches',
        version: '1.0.0',
        permissions: ['storage', 'activeTab'],
        host_permissions: ['*://*.linkedin.com/*'],
        action: {}
    },
    vite: () => ({
        plugins: [tailwindcss()],
    }),
});
