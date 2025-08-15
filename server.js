import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

async function createServer() {
    const app = express();

    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom'
    });

    app.use(vite.middlewares);

    // Handle all routes (but with proper error handling)
    app.use(async (req, res, next) => {
        const url = req.originalUrl;

        try {
            // 1. Read index.html
            let template = fs.readFileSync(
                path.resolve('./index.html'),
                'utf-8'
            );

            // 2. Apply Vite HTML transforms
            template = await vite.transformIndexHtml(url, template);

            // 3. Load the server entry (you'll need to create this)
            // const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');

            // 4. Render the app HTML
            // const appHtml = await render(url);

            // 5. Inject the app-rendered HTML into the template
            // For now, just serve the template as-is (SPA mode)
            const html = template;

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });

    app.listen(3005, () => {
        console.log('Server is running on http://localhost:3005');
    });
}

createServer().catch(console.error);