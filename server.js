// server.js
import express from 'express';
import { createServer as createViteServer } from 'vite';

async function createServer() {
    const app = express();

    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom'
    });

    app.use(vite.middlewares);

    // Your SSR rendering logic would go here
    app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        try {
            // ... (SSR logic to render your React components)
            // This part of the code is more complex and depends on your framework
        } catch (e) {
            vite.middlewares.handleError(e, req, res);
        }
    });

    app.listen(3005, () => {
        console.log('Server is running on http://localhost:3005');
    });
}

createServer();