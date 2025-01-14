import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import { connectPrinterApp } from '../controller/user.controller';

export const printerApp = Router();

printerApp.post('/connect', catchWrapper(connectPrinterApp));
