import { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/winston';

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
    logger.info('Returning own user');
    return response.json(request.user);
  }
}
