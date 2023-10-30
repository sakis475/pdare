import { Router } from 'express';
import { postLogin } from '../controller/login.controller';
import { catchWrapper } from '../error_handler/error-handler';
import { populateData } from '../controller/test.controller';

export const testRouter = Router();

testRouter.get('/', catchWrapper(populateData));
