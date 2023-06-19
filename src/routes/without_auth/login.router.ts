import { Router } from 'express';
import { postLogin } from '../../controller/login.controller';

export const loginRouter = Router();

loginRouter.post('/', postLogin);
