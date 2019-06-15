import Crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import validateUuid from 'uuid-validate';
import BadRequestError from '../lib/errors/bad-request.error';
import ResourceNotFoundError from '../lib/errors/resource-not-found.error';
import UnauthorizedError from '../lib/errors/unauthorized.error';
import SequelizeUtility from '../lib/sequelize-utility';
import Group from '../models/group.model';
import Invitation from '../models/invitation.model';
import InvitationService, { IInvitationAttributes } from '../service/invitation.service';

interface IRequestInvitationResource extends Request {
  resource: Invitation;
}

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
  public static async query(request: IRequestInvitationResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      const resources: Invitation[] = await InvitationService.query(request.query);
      return response.json(resources);
    } catch (error) {
      return next(error);
    }
  }

  public static read(request: IRequestInvitationResource, response: Response, next: NextFunction): Response {
    return response.json(request.resource);
  }

  /**
   * Update Invitation.
   * @param request
   * @param response
   * @param next
   */
  public static async update(request: IRequestInvitationResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      const resource: Invitation = await InvitationService.update(request.body, request.resource.get('uuid'));
      response.json(resource);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Express middleware to find Group by primary key.
   * @param request
   * @param response
   * @param next
   */
  public static async findByPK(request: IRequestInvitationResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      if (!validateUuid(request.params.uuid, 4)) {
        return next(new ResourceNotFoundError(`Invalid format UUID: ${request.params.uuid}`));
      }

      const resource: Invitation|null = await InvitationService.findByPk(request.params.uuid, request.query);

      if (!resource) {
        return next(new ResourceNotFoundError(`Resource not found with UUID: ${request.params.uuid}`));
      }

      request.resource = resource;
      return next();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Express middleware to check if all properties for PUT are set.
   * @param request
   * @param response
   * @param next
   */
  public static async checkAllPropertiesAreSet(request: Request, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      // Read-only fields excluded.
      SequelizeUtility.hasMandatoryAttributes(Invitation, Object.keys(request.body), [
        'groupUuid',
        'sentAt',
        'timesSent',
        'creatorUuid',
        'token',
        'expiresAt',
      ]);
      return next();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Middleware to check if a user is a member of the group.
   * Query string 'groupUuid' must be set.
   * @param request
   * @param response
   * @param next
   */
  public static async isMemberGroup(request: IRequestInvitationResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      // can not check if no groupUuid is set in query string or as parameter of URL.
      const groupUuid: string = request.query.groupUuid || request.resource.get('groupUuid');
      if (!groupUuid) {
        throw new BadRequestError();
      }

      const group: Group|null = await Group.findByPk(groupUuid);

      if (!group) {
        // Group not found, but showing not found error can expose data.
        throw new UnauthorizedError();
      }

      const result: boolean = await request.user.isMemberGroup(group);

      if (!result) {
        throw new UnauthorizedError();
      }

      return next();

    } catch (error) {
      return next(error);
    }
  }

  /**
   * Middleware to check if a user is an admin of the group.
   * Query string 'groupUuid' must be set.
   * @param request
   * @param response
   * @param next
   */
  public static async isAdminGroup(request: IRequestInvitationResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      // can not check if no groupUuid is set in query string or as parameter of URL.
      const groupUuid: string = request.query.groupUuid || request.resource.get('groupUuid');
      if (!groupUuid) {
        throw new BadRequestError();
      }

      const result: boolean = await request.user.isAdminGroup(groupUuid);

      if (!result) {
        throw new UnauthorizedError();
      }

      return next();

    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete the requested Group.
   * @param request
   * @param response
   * @param next
   */
  public static async delete(request: IRequestInvitationResource, response: Response, next: NextFunction): Promise<Response|void> {
    try {
      await InvitationService.delete(request.resource.get('uuid'));
      return response.status(204).json();
    } catch (error) {
      return next(error);
    }
  }
}
