import { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import Authentication from '../lib/authentication';
import UnauthorizedError from '../lib/errors/unauthorized.error';

export const authenticationRoutes: Router = Router()
  .get('/facebook', (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate('facebook-token', {
      session: false,
    }, (err: Error, user: any, info: any) => {
      if (err) {
        const unauthorized: UnauthorizedError = new UnauthorizedError(err.message);
        return response.status(unauthorized.status).json(unauthorized);
      } else if (info) {
        const unauthorized: UnauthorizedError = new UnauthorizedError(info.message);
        return response.status(unauthorized.status).json(unauthorized);
      }

      const token: string = Authentication.generateJWT(user);

      return response.json({
        token,
        user,
      });
    })(request, response, next);
  });
