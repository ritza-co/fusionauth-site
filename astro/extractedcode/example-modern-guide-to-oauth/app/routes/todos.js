import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import common from './common.js';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'todos.html'));
});

export default router;
