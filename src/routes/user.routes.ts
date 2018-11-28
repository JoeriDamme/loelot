import { Router } from 'express';
import UserController from '../controllers/user.controller';

export const userRoutes: Router = Router()
  .get('/me', UserController.getMe);
