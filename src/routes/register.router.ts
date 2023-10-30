import { Router } from 'express';
import { postRegister } from '../controller/register.controller';
import { catchWrapper } from '../error_handler/error-handler';

export const registerRouter = Router();

registerRouter.post('/', catchWrapper(postRegister));
