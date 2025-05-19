import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { printQueue } from './bullQueues';
import { Request, Response, NextFunction } from 'express';

export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath(`/admin/queues`);

createBullBoard({
  queues: [new BullMQAdapter(printQueue)],
  serverAdapter: serverAdapter,
});

// Authentication middleware
export const adminQueueAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = {
    username: 'admin',
    password: process.env.BULL_BOARD_PASSWORD,
  };

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [user, pass] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (user === auth.username && pass === auth.password) {
    return next(); // Authentication successful
  }

  res.set('WWW-Authenticate', 'Basic realm="401"'); // Prompt for credentials
  res.status(401).send('Authentication required.'); // Access denied
};
