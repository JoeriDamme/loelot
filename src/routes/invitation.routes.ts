import { Router } from 'express';
import InvitationController from '../controllers/invitation.controller';

export const invitationRoutes: Router = Router()
  .post('/', InvitationController.post)
  .get('/', InvitationController.query)
  .get('/:uuid', InvitationController.read)
  .put('/:uuid', InvitationController.checkAllPropertiesAreSet, InvitationController.update)
  .patch('/:uuid', InvitationController.update)
  .delete('/:uuid', InvitationController.delete)
  .param('uuid', InvitationController.findByPK);
