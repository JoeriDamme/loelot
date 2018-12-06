import { Moment } from 'moment';
import Invitation from '../models/invitation.model';

export interface IInvitationAttributes {
  creatorUuid: string;
  email: string;
  groupUuid: string;
  timesSent: number;
  sentAt: Moment;
}

export default class InvitationService {
  public static async create(data: IInvitationAttributes): Promise<Invitation> {
    return Invitation.create(data);
  }
}
