import { Router } from 'express';
import WishListController from '../controllers/wishlist.controller';
import Authorization from '../lib/authorization';

export const wishListRoutes: Router = Router()
  .get('/', Authorization.hasPermission(['wishlist:read']), WishListController.query)
  .post('/', Authorization.hasPermission(['wishlist:write']), WishListController.post)
  .get('/:uuid', Authorization.hasPermission(['wishlist:read']), WishListController.isMemberGroup, WishListController.read)
  .put('/:uuid', Authorization.hasPermission(['wishlist:write']), WishListController.isCreator, WishListController.checkAllPropertiesAreSet,
    WishListController.update)
  .patch('/:uuid', Authorization.hasPermission(['wishlist:write']), WishListController.isCreator, WishListController.update)
  .delete('/:uuid', Authorization.hasPermission(['wishlist:write']), WishListController.isCreator, WishListController.delete)
  .param('uuid', WishListController.findByPK);
