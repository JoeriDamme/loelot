import BadRequestError from '../lib/errors/bad-request.error';
import { SequelizeUtils } from '../lib/sequelize';
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
}
