import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.routes.js';
import attendanceRoutes from './server/routes/attendance.routes.js';
import booksRoutes from './server/routes/books.routes.js';
import newsRoutes from './server/routes/news.routes.js';
import complaintsRoutes from './server/routes/complaints.routes.js';
import studentsRoutes from './server/routes/students.routes.js';
import statsRoutes from './server/routes/stats.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(cookieParser());

  // Mount backend API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/books', booksRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/complaints', complaintsRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api/stats', statsRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'active',
      app: 'Campus360',
      university: 'Silver Oak University',
      time: new Date().toISOString()
    });
  });

  // Vite integration: Dev middleware vs Static dist
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Campus360] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Campus360 server:', err);
  process.exit(1);
});
