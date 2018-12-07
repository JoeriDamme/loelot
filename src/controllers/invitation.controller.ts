import Crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import UnauthorizedError from '../lib/errors/unauthorized.error';
import Invitation from '../models/invitation.model';
import InvitationService, { IInvitationAttributes } from '../service/invitation.service';

export default class InvitationController {
  /**
   * Create an Invitation.
   * @param request
   * @param response
   * @param next
   */
  public static async post(request: Request, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      const isAdmin: boolean = await request.user.isAdminGroup(request.body.groupUuid);

      if (!isAdmin) {
        throw new UnauthorizedError();
      }

      const data: IInvitationAttributes = {
        creatorUuid: request.user.get('uuid'),
        email: request.body.email,
        expiresAt: moment(),
        groupUuid: request.body.groupUuid,
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await InvitationService.create(data);

      // create method in Sequelize ignores excluding attributes
      const plain: any = resource.toJSON();
      delete plain.token;
      delete plain.expiresAt;

      return response.status(201).json(plain);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Query all Invitations.
   * @param request
   * @param response
   * @param next
   */
  public static async query(request: Request, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      const resources: Invitation[] = await InvitationService.query(request.query);
      return response.json(resources);
    } catch (error) {
      return next(error);
    }
  }
}
