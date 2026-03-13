import express from 'express';
import crypto from 'crypto';
import { pool, memoryProjects } from '../../shared/infrastructure/db.js';
import { authenticateToken } from '../../shared/infrastructure/middlewares.js';

export const projectRouter = express.Router();

router.get('/api/my-projects', authenticateToken, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string || '').toLowerCase();
      const sort = req.query.sort as string || 'newest'; // 'newest' | 'oldest'

      let projects = [];

      if (pool) {
        // Since project details are stored in the JSONB `data` column, we can do filtering/sorting dynamically.
        // A full SQL-level approach on JSONB:
        const result = await pool.query('SELECT * FROM projects WHERE user_id = $1', [req.user.id]);
        projects = result.rows.map(row => ({ ...row.data, id: row.id, userId: row.user_id }));
      } else {
        projects = memoryProjects.filter(p => p.userId === req.user.id);
      }

      // Apply search filter (by project name)
      if (search) {
        projects = projects.filter((p: any) => (p.name || '').toLowerCase().includes(search));
      }

      // Apply sorting by createdAt date (assuming createdAt exists or sorting by id/insertion order)
      projects.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sort === 'oldest' ? dateA - dateB : dateB - dateA; // newest first by default
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProjects = projects.slice(startIndex, endIndex);

      res.json({
        data: paginatedProjects,
        total: projects.length,
        page,
        limit,
        totalPages: Math.ceil(projects.length / limit)
      });
    } catch (err) {
      console.error('Fetch projects error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/api/projects', authenticateToken, async (req: any, res) => {
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
