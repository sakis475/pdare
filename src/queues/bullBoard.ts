import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { printQueue } from './bullQueues';
import { Request, Response, NextFunction } from 'express';
import { closeOrdersInactiveRepeatableQueue } from './bullRepeatableQueues';

const serverAdapter = new ExpressAdapter();

console.log('Initializing Bull Board...');
createBullBoard({
  queues: [
    new BullMQAdapter(printQueue),
    new BullMQAdapter(closeOrdersInactiveRepeatableQueue),
  ],
  serverAdapter: serverAdapter,
});

export const bullBoardbasePath = `/api${process.env.OBS_PATH}/v1/admin/queues`;
serverAdapter.setBasePath(bullBoardbasePath);
console.log(`Bull Board base path set to: ${bullBoardbasePath}`);

export const BullRouter = serverAdapter.getRouter();

// Authentication middleware
export const adminQueueAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('Authentication middleware triggered.');
  const auth = {
    username: 'admin',
    password: process.env.BULL_BOARD_PASSWORD,
  };

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [user, pass] = Buffer.from(b64auth, 'base64').toString().split(':');

  console.log(
    `Received credentials - Username: ${user}, Password: ${
      pass ? '***' : 'missing'
    }`
  );

  if (user === auth.username && pass === auth.password) {
    console.log('Authentication successful.');
    return next(); // Authentication successful
  }

  console.log('Authentication failed.');
  res.set('WWW-Authenticate', 'Basic realm="401"'); // Prompt for credentials
  res.status(401).send('Authentication required.'); // Access denied
};
