import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Request } from 'express';
import { errorHandler } from './error_handler/error-handler';
import cors from 'cors';
import { api } from './routes/api.routes';
import morgan from 'morgan';
import { redisConnection } from './database/redis';
import fs from 'fs';
import path from 'path';
import { startWorkers } from './queues/bullWorker';
import {
  adminQueueAuthMiddleware,
  bullBoardbasePath,
  BullRouter,
} from './queues/bullBoard';
import { publicapi } from './routes/public.routes';

// initBrowser();
startWorkers();
redisConnection();
const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

morgan.token('body', (req: Request, res) => JSON.stringify(req.body, null, 2));

// app.use(
//   morgan(`:date[iso] :response-time ms :method :status :url
// \x1b[33m:body`)
// );

app.use(
  morgan(`:date[iso] :response-time ms :method :status :url`, {
    skip: (req) => {
      return req.originalUrl.startsWith(
        `/api${process.env.OBS_PATH}/v1/admin/queues`
      );
    },
  })
);

app.use(
  `/api${process.env.OBS_PATH}/v1/admin/queues`,
  // adminQueueAuthMiddleware,
  BullRouter
);

app.use(`/public/${process.env.OBS2_PATH}`, publicapi);

// Debugging middleware registration
console.log(`Registering Bull Board router at path: ${bullBoardbasePath}`);
app.use(
  bullBoardbasePath,
  // adminQueueAuthMiddleware, // Uncomment if authentication is required
  BullRouter
);
console.log('Bull Board router registered successfully.');

app.use(`/api${process.env.OBS_PATH}/v1`, api);

app.get('/servetab-printer-app', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const logMessage = `[${new Date().toISOString()}] IP: ${ip} - User-Agent: ${userAgent}\n`;

  const logFilePath = path.join(__dirname, 'redirect.log');
  fs.appendFileSync(logFilePath, logMessage, 'utf8');

  res.redirect(process.env.PRINTER_APP_WIN_URL as string);
});

//express custom error handler
app.use(errorHandler);

export { app };
