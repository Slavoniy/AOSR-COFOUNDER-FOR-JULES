import express from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'stroydoc-secret-key';
const PORT = 3000;
const DATABASE_URL = process.env.DATABASE_URL;

let pool: pg.Pool | null = null;
if (DATABASE_URL) {
  pool = new pg.Pool({
    connectionString: DATABASE_URL,
    // Note: in a production setting you'd probably want ssl depending on the database config
    // ssl: { rejectUnauthorized: false }
  });
}

// In-memory fallback if no DB connection
const memoryUsers: any[] = [];
const memoryProjects: any[] = [];

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

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;

    // Input Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = crypto.randomUUID();
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      if (pool) {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: 'User already exists' });
        }
        await pool.query(
          'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4)',
          [id, email, hashedPassword, name]
        );
      } else {
        if (memoryUsers.find(u => u.email === email)) {
          return res.status(400).json({ error: 'User already exists' });
        }
        memoryUsers.push({ id, email, password: hashedPassword, name });
      }

      const token = jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.json({ id, email, name });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      let user = null;
      if (pool) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        user = result.rows[0];
      } else {
        user = memoryUsers.find(u => u.email === email);
      }

      if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.json({ id: user.id, email: user.email, name: user.name });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'ok' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  app.get('/api/my-projects', authenticateToken, async (req: any, res) => {
    try {
      if (pool) {
        const result = await pool.query('SELECT * FROM projects WHERE user_id = $1', [req.user.id]);
        res.json(result.rows.map(row => ({ ...row.data, id: row.id, userId: row.user_id })));
      } else {
        const userProjects = memoryProjects.filter(p => p.userId === req.user.id);
        res.json(userProjects);
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/projects', authenticateToken, async (req: any, res) => {
    const id = crypto.randomUUID();
    const projectData = {
      ...req.body,
      id,
      userId: req.user.id,
      createdAt: new Date().toISOString().split('T')[0],
      acts: req.body.acts || []
    };

    try {
      if (pool) {
        await pool.query(
          'INSERT INTO projects (id, user_id, data) VALUES ($1, $2, $3)',
          [id, req.user.id, JSON.stringify(projectData)]
        );
      } else {
        memoryProjects.push(projectData);
      }
      res.status(201).json(projectData);
    } catch (err) {
      console.error('Create project error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/acts/:actId/status', authenticateToken, async (req: any, res) => {
    const { actId } = req.params;
    const { status } = req.body;
    
    try {
      if (pool) {
        // Find act in user's projects
        const result = await pool.query('SELECT * FROM projects WHERE user_id = $1', [req.user.id]);
        for (const row of result.rows) {
          const project = row.data;
          const act = project.acts?.find((a: any) => a.id === actId);
          if (act) {
            act.status = status;
            await pool.query('UPDATE projects SET data = $1 WHERE id = $2', [JSON.stringify(project), row.id]);
            return res.json(act);
          }
        }
      } else {
        for (const project of memoryProjects) {
          if (project.userId !== req.user.id) continue;
          const act = project.acts?.find((a: any) => a.id === actId);
          if (act) {
            act.status = status;
            return res.json(act);
          }
        }
      }
      res.status(404).json({ error: 'Act not found' });
    } catch (err) {
      console.error('Update act status error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
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
