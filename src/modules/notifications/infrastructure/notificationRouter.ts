import express from 'express';
import { pool, memoryNotifications } from '../../shared/infrastructure/db.js';
import { authenticateToken } from '../../shared/infrastructure/middlewares.js';

export const notificationRouter = express.Router();

router.get('', authenticateToken, async (req: any, res) => {
    try {
      if (pool) {
        const result = await pool.query(
          'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
          [req.user.id]
        );
        res.json(result.rows);
      } else {
        const userNotifs = memoryNotifications.filter(n => n.userId === req.user.id);
        res.json(userNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/read', authenticateToken, async (req: any, res) => {
    try {
      if (pool) {
        await pool.query(
          'UPDATE notifications SET is_read = true WHERE user_id = $1',
          [req.user.id]
        );
        res.json({ status: 'ok' });
      } else {
        memoryNotifications.forEach(n => {
          if (n.userId === req.user.id) {
            n.is_read = true;
          }
        });
        res.json({ status: 'ok' });
      }
    } catch (err) {
      console.error('Mark notifications read error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Seed mock notification for testing (development only)
  router.post('/seed', authenticateToken, async (req: any, res) => {
    const id = crypto.randomUUID();
    const notif = {
      id,
      user_id: req.user.id,
      userId: req.user.id,
      title: 'Добро пожаловать!',
      message: 'Вы успешно вошли в систему StroyDoc AI.',
      is_read: false,
      created_at: new Date().toISOString()
    };
    try {
      if (pool) {
        await pool.query(
          'INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [notif.id, notif.user_id, notif.title, notif.message, notif.is_read, notif.created_at]
        );
      } else {
        memoryNotifications.push(notif);
      }
      res.json(notif);
    } catch (err) {
      console.error('Seed notification error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
