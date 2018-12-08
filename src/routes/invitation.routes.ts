import { Router } from 'express';
import InvitationController from '../controllers/invitation.controller';

export const invitationRoutes: Router = Router()
  .post('/', InvitationController.post)
  .get('/', InvitationController.query)
  .get('/:uuid', InvitationController.read)
  .put('/:uuid', InvitationController.checkAllPropertiesAreSet, InvitationController.update)
  .patch('/:uuid', InvitationController.update)
  .param('uuid', InvitationController.findByPK);
