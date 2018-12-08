import { Moment } from 'moment';
import ApplicationError from '../lib/errors/application.error';
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
   * Find Invitation by UUID.
   * @param uuid
   */
  public static async findByPk(uuid: string, options: any): Promise<Invitation|null> {
    const queryOptions: IInvitationQueryOptions = InvitationService.getQueryOptions(options);
    return Invitation.findByPk(uuid, queryOptions);
  }

  /**
   * Update an Invitation.
   * @param data
   * @param uuid
   */
  public static async update(data: IInvitationAttributes, uuid: string): Promise<Invitation> {
    await Invitation.update(data, {
      where: {
        uuid,
      },
    });
    const invitation: Invitation|null = await Invitation.findByPk(uuid);

    if (!invitation) {
      throw new ApplicationError('Error fetching resource after update');
    }

    return invitation;
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
