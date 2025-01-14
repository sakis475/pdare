import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Request } from 'express';
import { errorHandler } from './error_handler/error-handler';
import cors from 'cors';
import { api } from './routes/api.routes';
import morgan from 'morgan';
import { redisConnection } from './database/redis';

// initBrowser();
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

app.use(morgan(`:date[iso] :response-time ms :method :status :url`));

app.use('/api/v1', api);

//express custom error handler
app.use(errorHandler);

export { app };
