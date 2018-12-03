import Group from '../models/group.model';

export interface IGroupAttributes {
  name: string;
  creatorUuid: string;
  adminUuid: string;
  icon: string;
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
  public static async query(): Promise<Group[]> {
    return Group.findAll();
  }

  /**
   * Find Group by UUID.
   * @param uuid
   */
  public static async findByPk(uuid: string): Promise<Group|null> {
    return Group.findByPrimary(uuid);
  }
}
