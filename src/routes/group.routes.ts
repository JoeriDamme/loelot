import { Router } from 'express';
import GroupController from '../controllers/group.controller';

export const groupRoutes: Router = Router()
  .post('/', GroupController.post)
  .get('/', GroupController.query)
  .get('/:uuid', GroupController.read)
  .param('uuid', GroupController.findByPK);
