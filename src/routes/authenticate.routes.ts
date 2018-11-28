import { Request, Response, Router } from 'express';
import passport from 'passport';
import Authentication from '../lib/authentication';

export const authenticationRoutes: Router = Router()
  .get('/auth/facebook', passport.authenticate('facebook-token', {
    session: false,
  }), (request: Request, response: Response) => {
    const token: string = Authentication.generateJWT(request.user);
    return response.json({
      token,
      user: request.user,
    });
  });
