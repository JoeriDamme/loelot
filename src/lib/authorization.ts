import { NextFunction, Request, Response} from 'express';
import Authentication, { IJWTPayload } from './authentication';
import ForbiddenError from './errors/forbidden.error';
import UnauthorizedError from './errors/unauthorized.error';

export default class Authorization {
  public static hasPermission(guard: string[]): (request: Request, response: Response, next: NextFunction) => void {
    return (request: Request, response: Response, next: NextFunction): void => {
      try {
        const authorizationheader: string|undefined = request.header('authorization');
        if (!authorizationheader) {
          throw new UnauthorizedError();
        }

        // extract token from 'Bearer xxx' string and decode it for permissions
        const jwt: string = Authentication.getTokenFromAuthorizationHeader(authorizationheader);
        const payload: IJWTPayload = Authentication.decodeJWT(jwt);
        const allowed: boolean = guard.some((check: string) => payload.permissions.includes(check));

        if (allowed) {
          return next();
        }

        // user has no permission to be here
        throw new ForbiddenError();
      } catch (error) {
        return next(error);
      }
    };
  }
}
