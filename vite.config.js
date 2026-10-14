import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';

export default defineConfig({
    // Set BASE_PATH=/<repo-name>/ when building for GitHub Pages. Defaults to '/' locally.
    base: process.env.BASE_PATH || '/',
    plugins: [
        react(),
        {
            name: 'route-rewrite-plugin',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    const url = req.url ? req.url.split('?')[0] : '';
                    if (url === '/garden-timer' || url === '/app') {
                        req.url = '/app.html';
                    }
                    next();
                });
            },
        },
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(import.meta.dirname, 'index.html'),
                app: resolve(import.meta.dirname, 'app.html'),
            },
        },
    },
});
