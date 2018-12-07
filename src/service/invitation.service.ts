import { Moment } from 'moment';
import Group from '../models/group.model';
import Invitation from '../models/invitation.model';
import User from '../models/user.model';

export interface IInvitationAttributes {
  creatorUuid: string;
  email: string;
  groupUuid: string;
  timesSent: number;
  sentAt: Moment;
  token: string;
  expiresAt: Moment;
}

interface IInvitationAssociation {
  as: string;
  model: any;
}

interface IInvitationQueryOptions {
  include: IInvitationAssociation[];
}

export default class InvitationService {
  /**
   * Create an Invitation with given data.
   * @param data
   */
  public static async create(data: IInvitationAttributes): Promise<Invitation> {
    return Invitation.create(data);
  }

  /**
   * Query all Invitations.
   * @param options
   */
  public static async query(options: any): Promise<Invitation[]> {
    const queryOptions: IInvitationQueryOptions = InvitationService.getQueryOptions(options);
    return Invitation.findAll(queryOptions);
  }

  /**
   * Get query options.
   * @param options
   */
  private static getQueryOptions(options: any): IInvitationQueryOptions {
    const result: IInvitationQueryOptions = {
      include: [],
    };
    if (options.include) {
      options.include.split(',').forEach((inclusion: string) => {
        const relationship: IInvitationAssociation = InvitationService.getIncludeOption(inclusion);
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
  private static getIncludeOption(model: string): IInvitationAssociation {
    const associations: IInvitationAssociation[] = [{
      as: 'group',
      model: Group,
    }, {
      as: 'creator',
      model: User,
    }];

    return associations.filter((association: IInvitationAssociation) => association.as === model)[0];
  }
}
