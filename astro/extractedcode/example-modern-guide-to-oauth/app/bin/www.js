#!/usr/bin/env node

import app from '../app.js';
import debugLib from 'debug';
import http from 'http';

const debug = debugLib('fusionauth-modern-guide-to-oauth:server');

app.set('port', 3000);

const server = http.createServer(app);
server.listen(3000);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') throw error;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EADDRINUSE':
      console.error('Port 3000 is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
