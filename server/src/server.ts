import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import express, { Request, Response, NextFunction, Router } from 'express';

import 'express-async-errors';

import logger from 'jet-logger';
import EnvVars from '@src/declarations/major/EnvVars';
import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';
import { NodeEnvs } from '@src/declarations/enums';
import { RouteError } from '@src/declarations/classes';

import { Client } from 'wpilib-nt-client';
import WebSocket, { WebSocketServer } from 'ws';


// **** Init express **** //

const app = express();


// **** Set basic express settings **** //

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(EnvVars.cookieProps.secret));

// Show routes called in console during development
if (EnvVars.nodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}


const networkTables = new Client();

networkTables.setReconnectDelay(1000);

networkTables.start((isConnected, error) => {
  console.log(isConnected, error);
}, 'localhost');

const wss = new WebSocketServer({port: 13102});
wss.on('connection', (ws) => {
  console.log('connection', ws.url);
  ws.on('message', (data) => {
    console.log('received: %s', data);
  });

  ws.send('something');

  networkTables.addListener((key, value, valueType, type, id, flags) => {
    ws.send(JSON.stringify({networkTableUpdate: {
      key, value, valueType, type, id, flags
    }}));
  }, true);
});

// **** Add API routes **** //

let router = Router();

router.get('/test', (req, res) => {
  res.send({message: 'hello'});
})

// Add APIs
app.use('/api', router);

// Setup error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  logger.err(err, true);
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
  }
  return res.status(status).json({ error: err.message });
});


// **** Serve front-end content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to login pg by default
app.get('/', (_: Request, res: Response) => {
  res.redirect('http://localhost:3131');
});


// **** Export default **** //

export default app;
