import { Router } from 'express';
import UserController from '../controllers/user.controller';
import Authorization from '../lib/authorization';

export const userRoutes: Router = Router()
  .get('/me', Authorization.hasPermission(['user:read']), UserController.getMe);
