import { NextFunction, Request, Response } from 'express';
import validateUuid from 'uuid-validate';
import ResourceNotFoundError from '../lib/errors/resource-not-found.error';
import Group from '../models/group.model';
import GroupService, { IGroupAttributes } from '../service/group.service';

interface IRequestGroupResource extends Request {
  resource: Group;
}

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

  /**
   * GET all the Groups from the database.
   * @param request
   * @param response
   * @param next
   */
  public static async query(request: Request, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      const resources: Group[] = await GroupService.query();
      return response.json(resources);
    } catch (error) {
      return next(error);
    }
  }

  public static read(request: IRequestGroupResource, response: Response, next: NextFunction): Response {
    return response.json(request.resource);
  }

  // tslint:disable-next-line:max-line-length
  public static async findByPK(request: IRequestGroupResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      if (!validateUuid(request.params.uuid, 4)) {
        return next(new ResourceNotFoundError(`Invalid format UUID: ${request.params.uuid}`));
      }
      const resource: Group|null = await GroupService.findByPk(request.params.uuid);

      if (!resource) {
        return next(new ResourceNotFoundError(`Resource not found with UUID: ${request.params.uuid}`));
      }
      request.resource = resource;
      return next();
    } catch (error) {
      return next(error);
    }
  }
}
