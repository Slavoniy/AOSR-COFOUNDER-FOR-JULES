import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../shared/infrastructure/db.js';
import { memoryUsers } from '../../shared/infrastructure/db.js';
import { authenticateToken } from '../../shared/infrastructure/middlewares.js';

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-jwt';

router.post('/api/auth/register', async (req, res) => {
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

  router.post('/api/auth/login', async (req, res) => {
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

  router.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'ok' });
  });

  router.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // Notifications endpoints
