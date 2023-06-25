import { Router } from 'express';
import { postRegister } from '../../controller/register.controller';

export const registerRouter = Router();

registerRouter.post('/', postRegister);
