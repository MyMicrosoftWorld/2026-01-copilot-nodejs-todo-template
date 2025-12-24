import path from 'node:path';
import express from 'express';
import pino from 'pino-http';
import router from './routes/index';

const publicDir = path.join(__dirname, '..', 'public');
const app = express();

app.use(pino());
app.use(express.static(publicDir));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', router);

// SPA fallback
// SPA fallback for non-API requests — use middleware to avoid path-to-regexp issues
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    return next();
  }
  if (req.method !== 'GET') {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

export default app;
