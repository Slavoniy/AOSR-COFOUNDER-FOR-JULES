import express from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'stroydoc-secret-key';
const PORT = 3000;

// In-memory "database"
const users = [
  { id: '1', email: 'ivan@stroydoc.ai', password: bcrypt.hashSync('password123', 10), name: 'Иван Иванов' }
];

const projects = [
  {
    id: '1',
    userId: '1',
    name: 'ЖК "Северное Сияние"',
    object: 'Многоквартирный жилой дом, корп. 1',
    developer: { name: 'ООО "ГлавЗастрой"', requisites: 'ИНН 7701234567, КПП 770101001', sro: 'СРО-С-001-01012009' },
    contractor: { name: 'АО "СтройТех"', requisites: 'ИНН 7702345678, КПП 770201001', sro: 'СРО-С-002-02022010' },
    designer: { name: 'ООО "Проект-М"', requisites: 'ИНН 7703456789, КПП 770301001', sro: 'СРО-П-003-03032011' },
    participants: {
      repDeveloper: 'Иванов И.И., приказ №12 от 10.01.2024',
      repContractor: 'Петров П.П., приказ №45 от 12.01.2024',
      repContractorSk: 'Сидоров С.С., приказ №46 от 12.01.2024',
      repDesigner: 'Кузнецов К.К., приказ №5 от 15.01.2024',
      repSubcontractor: 'Васильев В.В., приказ №8 от 20.01.2024'
    },
    createdAt: '2024-01-15',
    acts: [
      {
        id: '101',
        number: '1',
        workName: 'Разработка грунта в котловане',
        unit: 'м3',
        amount: '1250',
        scheme: 'Исполнительная схема №1',
        nextWorks: 'Устройство песчаного основания',
        materials: 'Грунт II группы',
        startDate: '15', startMonth: 'января', startYear: '2024',
        endDate: '20', endMonth: 'января', endYear: '2024',
        standards: 'СП 45.13330.2017',
        status: 'draft'
      }
    ]
  }
];

async function startServer() {
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
  app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password: bcrypt.hashSync(password, 10),
      name
    };
    
    users.push(newUser);
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ id: newUser.id, email: newUser.email, name: newUser.name });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ id: user.id, email: user.email, name: user.name });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'ok' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  app.get('/api/my-projects', authenticateToken, (req: any, res) => {
    const userProjects = projects.filter(p => p.userId === req.user.id);
    res.json(userProjects);
  });

  app.post('/api/projects', authenticateToken, (req: any, res) => {
    const project = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      userId: req.user.id,
      createdAt: new Date().toISOString().split('T')[0],
      acts: []
    };
    projects.push(project);
    res.status(201).json(project);
  });

  app.patch('/api/acts/:actId/status', authenticateToken, (req: any, res) => {
    const { actId } = req.params;
    const { status } = req.body;
    
    // Find act in all projects (simplified)
    for (const project of projects) {
      const act = project.acts.find(a => a.id === actId);
      if (act) {
        act.status = status;
        return res.json(act);
      }
    }
    res.status(404).json({ error: 'Act not found' });
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
