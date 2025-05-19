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
import { adminQueueAuthMiddleware, serverAdapter } from './queues/bullBoard';

// initBrowser();
startWorkers();
redisConnection();
const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());
morgan.token('body', (req: Request, res) => JSON.stringify(req.body, null, 2));

// app.use(
//   morgan(`:date[iso] :response-time ms :method :status :url
// \x1b[33m:body`)
// );

app.use(
  morgan(`:date[iso] :response-time ms :method :status :url`, {
    skip: (req) => {
      return req.originalUrl.startsWith('/admin/queues');
    },
  })
);

app.use(`/admin/queues`, adminQueueAuthMiddleware, serverAdapter.getRouter());

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
