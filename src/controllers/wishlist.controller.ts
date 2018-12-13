import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../lib/errors/bad-request.error';
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
}
