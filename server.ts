import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './server/routes/authRoutes.js';
import studentRoutes from './server/routes/studentRoutes.js';
import facultyRoutes from './server/routes/facultyRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';
import aiRoutes from './server/routes/aiRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';
import noticeRoutes from './server/routes/noticeRoutes.js';
import searchRoutes from './server/routes/searchRoutes.js';
import { getDb } from './server/db/index.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize and seed database if not already done
  getDb();

  // Parse JSON payloads and URL encoded bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS headers for flexible API access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CampusConnect API',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/faculty', facultyRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/notices', noticeRoutes);
  app.use('/api/search', searchRoutes);

  // Global Error Handler for API
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error occurred in CampusConnect'
    });
  });

  // Vite middleware for development vs static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusConnect] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
