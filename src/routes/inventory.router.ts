import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import { getInventory } from '../controller/inventory.controller';

export const inventoryRouter = Router();

//Get orders
inventoryRouter.get('/', catchWrapper(getInventory));
