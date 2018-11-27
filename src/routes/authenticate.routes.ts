import { Request, Response, Router } from 'express';
import passport from 'passport';

export const authenticationRoutes: Router = Router()
  .get('/auth/facebook', passport.authenticate('facebook-token'), (request: Request, response: Response) => {
    return response.json(request.user);
  });
