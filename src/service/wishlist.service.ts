import { Association, Filterable, Includeable } from 'sequelize/types';
import { inspect } from 'util';
import ApplicationError from '../lib/errors/application.error';
import { logger } from '../lib/winston';
import WishList from '../models/wishlist.model';

export interface IWishListAttributes {
  creatorUuid: string;
  description: string;
  groupUuid: string;
  rank: number;
}

interface IWishlistAssociation {
  model: Association;
  query: string;
}

interface IWishListQueryOptions {
  include: Includeable[];
  where: Filterable['where'];
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
    logger.debug(`wishlist.service.query: argument for FindAll "${JSON.stringify(inspect(queryOptions))}"`);

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
      where: {},
    };

    Object.entries(options).forEach(([key, value]: [string, string]) => {
      logger.debug(`wishlist.service.query: process getQueryOptions - key: "${key}", value: "${value}"`);

      if (key.toLocaleLowerCase() === 'include') {
        value.split(',').forEach((inclusion: string) => {
          const relationship: Includeable = WishListService.getIncludeOption(inclusion);
          if (relationship) {
            result.include.push(relationship);
          }
        });
      } else {
        // keys not handled here should be considered part of the Where clause with operator AND
        if (result.where) {
          result.where[key] = value;
        }
      }
    });

    return result;
  }

  /**
   * Generate include for query options.
   * @param model
   */
  private static getIncludeOption(find: string): Includeable {
    const associations: IWishlistAssociation[] = [{
      model: WishList.associations.group,
      query: 'group',
    }, {
      model: WishList.associations.creator,
      query: 'creator',
    }];

    return associations.filter((association: IWishlistAssociation) => association.query === find)[0].model;
  }
}
