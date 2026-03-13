import express from 'express';
import { createServer as createViteServer } from 'vite';

import cookieParser from 'cookie-parser';

import path from 'path';
import { fileURLToPath } from 'url';


import dotenv from 'dotenv';



import { pool } from './src/modules/shared/infrastructure/db.js';
import { authRouter } from './src/modules/auth/infrastructure/authRouter.js';
import { notificationRouter } from './src/modules/notifications/infrastructure/notificationRouter.js';
import { projectRouter } from './src/modules/projects/infrastructure/projectRouter.js';
import { estimateRouter } from './src/modules/ai-engine/infrastructure/estimateRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'stroydoc-secret-key';
const PORT = 3000;






async function initializeDatabase() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

async function startServer() {
  await initializeDatabase();

  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Health Check
  app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.1_forced_sync' }));



  // API Routes
    app.use('/api/auth', authRouter);

    app.use('/api/notifications', notificationRouter);


    app.use(projectRouter);


    app.use(estimateRouter);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
