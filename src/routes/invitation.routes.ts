import { Router } from 'express';
import InvitationController from '../controllers/invitation.controller';

export const invitationRoutes: Router = Router()
  .post('/', InvitationController.post);
