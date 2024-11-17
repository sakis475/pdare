import { Router } from 'express';

import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';

import {
  getItemPropertiesPatterns,
  saveItemPropertiesPattern,
} from '../controller/itemPropertiesPattern.controller';

export const itemPropertyPatternRouter = Router();

itemPropertyPatternRouter.get(
  '/',
  authMiddleware,
  catchWrapper(getItemPropertiesPatterns)
);

itemPropertyPatternRouter.patch(
  '/save',
  authMiddleware,
  catchWrapper(saveItemPropertiesPattern)
);
