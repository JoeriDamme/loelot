import { Router } from 'express';
import InvitationController from '../controllers/invitation.controller';
import Authorization from '../lib/authorization';

export const invitationRoutes: Router = Router()
  .post('/', Authorization.hasPermission(['invitation:write']), InvitationController.post)
  .get('/', Authorization.hasPermission(['invitation:read']), InvitationController.isMemberGroup, InvitationController.query)
  .get('/:uuid', Authorization.hasPermission(['invitation:read']), InvitationController.isMemberGroup, InvitationController.read)
  .put('/:uuid', Authorization.hasPermission(['invitation:write']), InvitationController.isAdminGroup,
    InvitationController.checkAllPropertiesAreSet, InvitationController.update)
  .patch('/:uuid', Authorization.hasPermission(['invitation:write']), InvitationController.isAdminGroup, InvitationController.update)
  .delete('/:uuid', Authorization.hasPermission(['invitation:write']), InvitationController.isAdminGroup, InvitationController.delete)
  .param('uuid', InvitationController.findByPK);
