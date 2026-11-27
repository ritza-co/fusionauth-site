import express from 'express';
import common from './common.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const authorized = await common.authorizationCheck(req, res);
    if (!authorized) return res.sendStatus(403);
    const todos = common.getTodos();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(todos));
  }
  catch (err) { console.log(err); }
});

router.post('/complete/:id', async (req, res, next) => {
  try {
    const authorized = await common.authorizationCheck(req, res);
    if (!authorized) return res.sendStatus(403);
    const idToUpdate = parseInt(req.params.id);
    common.completeTodo(idToUpdate);
    /*
    const wuphfTokens = {}
    const wuphfResponse = await fetch('https://api.wuphf.com/send', { method: 'POST', headers: {
          auth: { 'bearer': wuphfTokens.accessToken, 'refresh': wuphfTokens.refreshToken }
        }
      });
    // check for status, log if not 200
    */
    const todos = common.getTodos();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(todos));
  }
  catch (err) { console.log(err); }
});

router.post('/uncomplete/:id', async (req, res, next) => {
  try {
    const authorized = await common.authorizationCheck(req, res);
    if (!authorized) return res.sendStatus(403);
    const idToUpdate = parseInt(req.params.id);
    common.uncompleteTodo(idToUpdate);
    const todos = common.getTodos();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(todos));
  }
  catch (err) { console.log(err); }
});

export default router;
