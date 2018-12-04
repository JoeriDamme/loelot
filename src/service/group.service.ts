import ApplicationError from '../lib/errors/application.error';
import Group from '../models/group.model';
import User from '../models/user.model';

export interface IGroupAttributes {
  name: string;
  creatorUuid: string;
  adminUuid: string;
  icon: string;
}

interface IGroupAssociation {
  as: string;
  model: any;
}

interface IGroupQueryOptions {
  include: IGroupAssociation[];
}

export default class GroupService {
  /**
   * Create a group.
   * @param data
   */
  public static async create(data: IGroupAttributes): Promise<Group> {
    return Group.create(data);
  }

  /**
   * Get all groups.
   * TODO: extend with query parameters.
   */
  public static async query(options: any): Promise<Group[]> {
    const queryOptions: IGroupQueryOptions = GroupService.getQueryOptions(options);
    return Group.findAll(queryOptions);
  }

  /**
   * Find Group by UUID.
   * @param uuid
   */
  public static async findByPk(uuid: string, options: any): Promise<Group|null> {
    const queryOptions: IGroupQueryOptions = GroupService.getQueryOptions(options);
    return Group.findByPk(uuid, queryOptions);
  }

  public static async update(data: IGroupAttributes, uuid: string): Promise<Group> {
    await Group.update(data, {
      where: {
        uuid,
      },
    });
    const group: Group|null = await Group.findByPk(uuid);

    if (!group) {
      throw new ApplicationError('Error fetching resource after update');
    }

    return group;
  }

  /**
   * Delete Group with UUID.
   * @param uuid
   */
  public static async delete(uuid: string): Promise<void> {
    await Group.destroy({
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
  private static getQueryOptions(options: any): IGroupQueryOptions {
    const result: IGroupQueryOptions = {
      include: [],
    };
    if (options.include) {
      options.include.split(',').forEach((inclusion: string) => {
        const relationship: IGroupAssociation = GroupService.getIncludeOption(inclusion);
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
  private static getIncludeOption(model: string): IGroupAssociation {
    const associations: IGroupAssociation[] = [{
      as: 'admin',
      model: User,
    }, {
      as: 'creator',
      model: User,
    }, {
      as: 'users',
      model: User,
    }];

    return associations.filter((association: IGroupAssociation) => association.as === model)[0];
  }
}
