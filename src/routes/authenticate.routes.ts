import { NextFunction, Request, Response, Router } from 'express';
import nock from 'nock';
import passport from 'passport';
import Authentication from '../lib/authentication';
import BadRequestError from '../lib/errors/bad-request.error';
// nock.recorder.rec();
export const authenticationRoutes: Router = Router()
  .get('/facebook', (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate('facebook-token', {
      session: false,
    }, (err: Error, user: any, info: any) => {
      if (err) {
        const badRequestError: BadRequestError = new BadRequestError(err.message);
        return response.status(badRequestError.status).json(badRequestError);
      } else if (info) {
        const badRequestError: BadRequestError = new BadRequestError(info.message);
        return response.status(badRequestError.status).json(badRequestError);
      }

      const token: string = Authentication.generateJWT(user);

      return response.json({
        token,
        user,
      });
    })(request, response, next);
  });
