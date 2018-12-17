import { Router } from 'express';
import GroupController from '../controllers/group.controller';
import Authorization from '../lib/authorization';

export const groupRoutes: Router = Router()
  .post('/', Authorization.isAuthorized(['group:write']), GroupController.post)
  .get('/', Authorization.isAuthorized(['group:read']), GroupController.query)
  .get('/:uuid', Authorization.isAuthorized(['group:read']), GroupController.read)
  .put('/:uuid', Authorization.isAuthorized(['group:write']), GroupController.checkAllPropertiesAreSet, GroupController.update)
  .patch('/:uuid', Authorization.isAuthorized(['group:write']), GroupController.update)
  .delete('/:uuid', Authorization.isAuthorized(['group:write']), GroupController.delete)
  .param('uuid', GroupController.findByPK);
