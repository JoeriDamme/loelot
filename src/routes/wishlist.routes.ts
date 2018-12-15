import { Router } from 'express';
import WishListController from '../controllers/wishlist.controller';

export const wishListRoutes: Router = Router()
  .get('/', WishListController.query)
  .post('/', WishListController.post)
  .get('/:uuid', WishListController.isMemberGroup, WishListController.read)
  .put('/:uuid', WishListController.isCreator, WishListController.checkAllPropertiesAreSet, WishListController.update)
  .patch('/:uuid', WishListController.isCreator, WishListController.update)
  .delete('/:uuid', WishListController.isCreator, WishListController.delete)
  .param('uuid', WishListController.findByPK);
