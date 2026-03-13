import express from 'express';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { pool, memoryProjects } from '../../shared/infrastructure/db.js';
import { authenticateToken } from '../../shared/infrastructure/middlewares.js';

const upload = multer({ storage: multer.memoryStorage() });
export const estimateRouter = express.Router();

estimateRouter.post('/api/estimates/parse-excel', authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const parsedData = EstimateParser.parseExcelBuffer(req.file.buffer);
      res.json({ rawData: parsedData });
    } catch (err: any) {
      console.error('Excel parse error:', err);
      res.status(500).json({ error: err.message || 'Failed to parse excel file' });
    }
  });

  estimateRouter.post('/api/estimates/process-chunk', authenticateToken, async (req: any, res) => {
    try {
      const { chunk } = req.body;
      if (!chunk || !Array.isArray(chunk)) {
        return res.status(400).json({ error: 'Invalid chunk data' });
      }

      try {
        const aiResult = await aiService.parseEstimateData(chunk);
        res.json({ data: aiResult });
      } catch (aiErr: any) {
         if (aiErr.message === "API_BLOCKED_BY_REGION") {
           const mockData = [
             { workName: "Монтаж металлоконструкций", materials: "Профиль стальной", quantity: 15, unit: "т" },
             { workName: "Устройство бетонной стяжки", materials: "Бетон В15", quantity: 50, unit: "м3" },
             { workName: "Окраска стен", materials: "Краска акриловая", quantity: 120, unit: "м2" }
           ];
           return res.json({
             data: mockData,
             warning: "API blocked by region. Using mock data for testing."
           });
         }
         throw aiErr;
      }
    } catch (err: any) {
      console.error('Chunk process error:', err);
      res.status(500).json({ error: err.message || 'Failed to process chunk' });
    }
  });

  estimateRouter.patch('/api/acts/:actId/status', authenticateToken, async (req: any, res) => {
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
