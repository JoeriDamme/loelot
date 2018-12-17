import { Router } from 'express';
import GroupController from '../controllers/group.controller';
import Authorization from '../lib/authorization';

export const groupRoutes: Router = Router()
  .post('/', Authorization.isAuthorized(['group:write']), GroupController.post)
  .get('/', GroupController.query)
  .get('/:uuid', GroupController.read)
  .put('/:uuid', GroupController.checkAllPropertiesAreSet, GroupController.update)
  .patch('/:uuid', GroupController.update)
  .delete('/:uuid', GroupController.delete)
  .param('uuid', GroupController.findByPK);
