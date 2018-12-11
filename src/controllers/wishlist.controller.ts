import { NextFunction, Request, Response } from 'express';
import WishList from '../models/wishlist.model';
import WishListService from '../service/wishlist.service';

interface IRequestWishListResource extends Request {
  resource: WishList;
}

export default class WishListController {
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
