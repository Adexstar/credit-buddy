import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

app.get('/api/overview', (_req, res) => {
  res.json({
    message: 'Unified AI Credit Bank API is running',
    features: ['credit buckets', 'rollover policies', 'proxy workflow']
  });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
