import { NextFunction, Request, Response} from 'express';
import Authentication, { IJWTPayload } from './authentication';

export default class Authorization {
  public static isAuthorized(guard: string[]): (request: Request, response: Response, next: NextFunction) => void {
    return (request: Request, response: Response, next: NextFunction): void => {
      const authorizationheader: string|undefined = request.header('authorization');
      if (!authorizationheader) {
        return next(new Error());
      }
      const jwt: string = Authentication.getTokenFromAuthorizationHeader(authorizationheader);
      const payload: IJWTPayload = Authentication.decodeJWT(jwt);

      const allowed: boolean = guard.some((check: string) => payload.permissions.includes(check));

      if (allowed) {
        return next();
      }

      return next(new Error());
    };
  }
}
