import { Router } from 'express';
import { postLogin } from '../../controller/login.controller';
import { catchWrapper } from '../../error_handler/error-handler';

export const loginRouter = Router();

loginRouter.post('/', catchWrapper(postLogin));
