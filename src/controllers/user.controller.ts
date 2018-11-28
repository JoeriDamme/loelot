import { NextFunction, Request, Response } from 'express';

/**
 *
 */
export default class UserController {
  /**
   * Get the user defined in the JWT token.
   * @param request x
   * @param response x
   * @param next x
   */
  public static getMe(request: Request, response: Response, next: NextFunction): Response|NextFunction {
    return response.json(request.user);
  }
}
