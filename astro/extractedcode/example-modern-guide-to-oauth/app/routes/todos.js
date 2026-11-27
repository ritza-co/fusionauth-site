import express from 'express';
import common from './common.js';
import config from './config.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('todos', {});
});

export default router;
