import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressSession from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import todosRouter from './routes/todos.js';
import todosApiRouter from './routes/todosapi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({ resave: false, saveUninitialized: false, secret: 'setec-astronomy' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/todos', todosRouter);
app.use('/api/todos', todosApiRouter);

app.use(function(req, res, next) {next(createError(404));});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;
