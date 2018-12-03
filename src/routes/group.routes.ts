import { Router } from 'express';
import GroupController from '../controllers/group.controller';

export const groupRoutes: Router = Router()
  .post('/', GroupController.post);
