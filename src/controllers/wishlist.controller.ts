import { NextFunction, Request, Response } from 'express';
import validateUuid from 'uuid-validate';
import BadRequestError from '../lib/errors/bad-request.error';
import ResourceNotFoundError from '../lib/errors/resource-not-found.error';
import UnauthorizedError from '../lib/errors/unauthorized.error';
import WishList from '../models/wishlist.model';
import WishListService from '../service/wishlist.service';

interface IRequestWishListResource extends Request {
  resource: WishList;
}

export default class WishListController {
  /**
   * Create a Wish List.
   * @param request
   * @param response
   * @param next
   */
  public static async post(request: Request, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      // check if user is in Group.
      const isMember: boolean = request.user.isMemberGroup(request.body.groupUuid);
      if (!isMember) {
        throw new BadRequestError();
      }

      const resource: WishList = await WishList.create(request.body);
      return response.status(201).json(resource);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Return one WishList
   * @param request
   * @param response
   * @param next
   */
  public static read(request: IRequestWishListResource, response: Response, next: NextFunction): Response {
    return response.json(request.resource);
  }

  /**
   * Express middleware to find WishList by primary key.
   * @param request
   * @param response
   * @param next
   */
  public static async findByPK(request: IRequestWishListResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      if (!validateUuid(request.params.uuid, 4)) {
        return next(new ResourceNotFoundError(`Invalid format UUID: ${request.params.uuid}`));
      }

      const resource: WishList|null = await WishListService.findByPk(request.params.uuid, request.query);

      if (!resource) {
        return next(new ResourceNotFoundError(`Resource not found with UUID: ${request.params.uuid}`));
      }

      request.resource = resource;
      return next();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Query all Wish Lists.
   * @param request
   * @param response
   * @param next
   */
  public static async query(request: IRequestWishListResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      const resources: WishList[] = await WishListService.query(request.query);
      return response.json(resources);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Middleware to check if a user is a member of the group.
   * Query string 'groupUuid' must be set.
   * @param request
   * @param response
   * @param next
   */
  public static async isMemberGroup(request: IRequestWishListResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      // can not check if no groupUuid is set in query string or as parameter of URL.
      // console.log(request.query.groupUuid);
      // console.log(request.resource.get('groupUuid'));
      const groupUuid: string = request.query.groupUuid || request.resource.get('groupUuid');
      if (!groupUuid) {
        throw new BadRequestError();
      }

      const result: boolean = await request.user.isMemberGroup(groupUuid);

      if (!result) {
        throw new UnauthorizedError();
      }

      return next();

    } catch (error) {
      return next(error);
    }
  }
}
