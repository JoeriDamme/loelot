import { Router } from 'express';
import WishListController from '../controllers/wishlist.controller';

export const wishListRoutes: Router = Router()
  .get('/', WishListController.query)
  .post('/', WishListController.post);
