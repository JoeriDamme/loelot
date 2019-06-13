import { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import Authentication from '../lib/authentication';
import ApplicationError from '../lib/errors/application.error';
import UnauthorizedError from '../lib/errors/unauthorized.error';
import { logger } from '../lib/winston';

export const authenticationRoutes: Router = Router()
  .get('/facebook', (request: Request, response: Response, next: NextFunction) => {
    logger.info('Authenticating with Facebook');
    passport.authenticate('facebook-token', {
      session: false,
    }, async (err: Error, user: any, info: any) => {
      if (err) {
        const unauthorized: UnauthorizedError = new UnauthorizedError(err.message);
        return response.status(unauthorized.status).json(unauthorized);
      } else if (info) {
        const unauthorized: UnauthorizedError = new UnauthorizedError(info.message);
        return response.status(unauthorized.status).json(unauthorized);
      }

      let token: string;
      try {
        logger.info('Generating JWT token');
        token = await Authentication.generateJWT(user);
      } catch (error) {
        return new ApplicationError(error.message);
      }

      logger.info('Responding with token and user');
      return response.json({
        token,
        user,
      });
    })(request, response, next);
  });
