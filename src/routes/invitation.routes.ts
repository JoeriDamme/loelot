import { Router } from 'express';
import InvitationController from '../controllers/invitation.controller';

export const invitationRoutes: Router = Router()
  .post('/', InvitationController.post)
  .get('/', InvitationController.isMemberGroup, InvitationController.query)
  .get('/:uuid', InvitationController.isMemberGroup, InvitationController.read)
  .put('/:uuid', InvitationController.isAdminGroup, InvitationController.checkAllPropertiesAreSet, InvitationController.update)
  .patch('/:uuid', InvitationController.isAdminGroup, InvitationController.update)
  .delete('/:uuid', InvitationController.isAdminGroup, InvitationController.delete)
  .param('uuid', InvitationController.findByPK);
