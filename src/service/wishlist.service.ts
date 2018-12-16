import ApplicationError from '../lib/errors/application.error';
import Group from '../models/group.model';
import User from '../models/user.model';
import WishList from '../models/wishlist.model';

interface IWishListAttributes {
  creatorUuid: string;
  description: string;
  groupUuid: string;
  rank: number;
}

interface IWishlistAssociation {
  as: string;
  model: any;
}

interface IWishListQueryOptions {
  include: IWishlistAssociation[];
}

export default class WishListService {
  /**
   * Create a Wish List.
   * @param data
   */
  public static async create(data: IWishListAttributes): Promise<WishList> {
    return WishList.create(data);
  }

  /**
   * Query all Wish Lists.
   * @param options
   */
  public static async query(options: any): Promise<WishList[]> {
    const queryOptions: IWishListQueryOptions = WishListService.getQueryOptions(options);
    return WishList.findAll(queryOptions);
  }

  /**
   * Find WishList by UUID.
   * @param uuid
   */
  public static async findByPk(uuid: string, options: any): Promise<WishList|null> {
    const queryOptions: IWishListQueryOptions = WishListService.getQueryOptions(options);
    return WishList.findByPk(uuid, queryOptions);
  }

  /**
   * Update a WishList.
   * @param data
   * @param uuid
   */
  public static async update(data: IWishListAttributes, uuid: string): Promise<WishList> {
    await WishList.update(data, {
      where: {
        uuid,
      },
    });
    const wishlist: WishList|null = await WishList.findByPk(uuid);

    if (!wishlist) {
      throw new ApplicationError('Error fetching resource after update');
    }

    return wishlist;
  }

  /**
   * Delete WishList with UUID.
   * @param uuid
   */
  public static async delete(uuid: string): Promise<void> {
    await WishList.destroy({
      where: {
        uuid,
      },
    });

    return;
  }

  /**
   * Get query options.
   * @param options
   */
  private static getQueryOptions(options: any): IWishListQueryOptions {
    const result: IWishListQueryOptions = {
      include: [],
    };
    if (options.include) {
      options.include.split(',').forEach((inclusion: string) => {
        const relationship: IWishlistAssociation = WishListService.getIncludeOption(inclusion);
        if (relationship) {
          result.include.push(relationship);
        }
      });
    }
    return result;
  }

  /**
   * Generate include for query options.
   * @param model
   */
  private static getIncludeOption(model: string): IWishlistAssociation {
    const associations: IWishlistAssociation[] = [{
      as: 'group',
      model: Group,
    }, {
      as: 'creator',
      model: User,
    }];

    return associations.filter((association: IWishlistAssociation) => association.as === model)[0];
  }
}