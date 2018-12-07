import Crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import UnauthorizedError from '../lib/errors/unauthorized.error';
import Invitation from '../models/invitation.model';
import InvitationService, { IInvitationAttributes } from '../service/invitation.service';

export default class InvitationController {
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

      return response.status(201).json(resource);
    } catch (error) {
      return next(error);
    }
  }
}
