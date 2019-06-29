import { Router } from 'express';
import GroupController from '../controllers/group.controller';
import Authorization from '../lib/authorization';

export const groupRoutes: Router = Router()
  .post('/', Authorization.hasPermission(['group:write']), GroupController.post)
  .get('/', Authorization.hasPermission(['group:read']), GroupController.query)
  .get('/:uuid', Authorization.hasPermission(['group:read']), GroupController.read)
  .put('/:uuid', Authorization.hasPermission(['group:write']), GroupController.isAdminGroup, GroupController.checkAllPropertiesAreSet, GroupController.update)
  .patch('/:uuid', Authorization.hasPermission(['group:write']), GroupController.isAdminGroup, GroupController.update)
  .delete('/:uuid', Authorization.hasPermission(['group:write']), GroupController.isAdminGroup, GroupController.delete)
  .param('uuid', GroupController.findByPK);
