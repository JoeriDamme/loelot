import { NextFunction, Request, Response } from 'express';
import Group from '../models/group.model';
import GroupService, { IGroupAttributes } from '../service/group.service';

/**
 *
 */
export default class GroupController {
  /**
   * POST receiver for creating a Group.
   * @param request x
   * @param response x
   * @param next x
   */
  public static async post(request: Request, response: Response, next: NextFunction): Promise<Response|void> {
    const data: IGroupAttributes = {
      adminUuid: request.user.get('uuid'),
      creatorUuid: request.user.get('uuid'),
      icon: request.body.icon,
      name: request.body.name,
    };

    try {
      const resource: Group = await GroupService.create(data);
      return response.status(201).json(resource);
    } catch (error) {
      return next(error);
    }
  }
}
