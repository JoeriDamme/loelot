import bluebird from 'bluebird';
import { expect } from 'chai';
import Crypto from 'crypto';
import moment from 'moment';
import request from 'supertest';
import validateUuid from 'uuid-validate';
import App from '../../src/app';
import Authentication from '../../src/lib/authentication';
import Group from '../../src/models/group.model';
import Invitation from '../../src/models/invitation.model';
import Role from '../../src/models/role.model';
import User from '../../src/models/user.model';

const uri: string = '/api/v1/invitations';

describe(uri, () => {
  let expressApp: Express.Application;
  let token: string;
  let user: User;
  let group: Group;
  let differentUser: User;
  let differentToken: string;
  let guest: User;
  let guestToken: string;
  let userRole: Role;

  before(async () => {
    const app: App = new App();
    app.start();
    expressApp = app.getExpressApplication();

    // clean up wish lists
    await Invitation.destroy({
      truncate: true,
      where: {},
    });

    const roles: Role[] = await Role.findAll();

    userRole = roles.filter((role: Role) => role.get('name') === 'user')[0];
    const guestRole: Role = roles.filter((role: Role) => role.get('name') === 'guest')[0];

    // create user for JWT token
    user = await User.create({
      displayName: 'Henkie Tankie',
      email: 'hankietankie@gmail.com',
      firstName: 'Henkie',
      lastName: 'Tankie',
      roleUuid: userRole.get('uuid'),
    });

    group = await Group.create({
      adminUuid: user.get('uuid'),
      creatorUuid: user.get('uuid'),
      icon: 'http://www.mooi.nl/kekeke.png',
      name: 'Groep met vrienden',
    });

    await user.addGroup(group);

    token = await Authentication.generateJWT(user);

    differentUser = await User.create({
      displayName: 'Henkie Tankie',
      email: 'hankietankie@gmail.com',
      firstName: 'Henkie',
      lastName: 'Tankie',
      roleUuid: userRole.get('uuid'),
    });

    differentToken = await Authentication.generateJWT(differentUser);

    guest = await User.create({
      displayName: 'Guest User2',
      email: 'guestuser2@mailinator.com',
      firstName: 'Guest',
      lastName: 'Users',
      roleUuid: guestRole.get('uuid'),
    });

    guestToken = await Authentication.generateJWT(guest);
  });

  describe('GET /', () => {
    it('should give a forbidden error on guest account', async () => {
      const response: any = await request(expressApp)
        .get(`${uri}`)
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).to.eq(403);
      expect(response.body).to.deep.equal({
        message: 'Forbidden',
        name: 'ForbiddenError',
        status: 403,
      });
    });

    it('should get all invitations', async () => {
      const invitations: any = [
        {
          creatorUuid: user.get('uuid'),
          email: 'ewhwehwehweh@mailinator.com',
          expiresAt: moment(),
          groupUuid: group.get('uuid'),
          sentAt: moment(),
          timesSent: 1,
          token: Crypto.randomBytes(48).toString('hex'),
        },
        {
          creatorUuid: user.get('uuid'),
          email: 'powegwehs@mailinator.com',
          expiresAt: moment(),
          groupUuid: group.get('uuid'),
          sentAt: moment(),
          timesSent: 1,
          token: Crypto.randomBytes(48).toString('hex'),
        },
      ];

      await bluebird.each(invitations, async (invitation: any) => Invitation.create(invitation));

      const response: any = await request(expressApp)
        .get(`${uri}?groupUuid=${group.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.length(2);
      response.body.forEach((invitation: any) => {
        expect(invitation).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'email', 'timesSent', 'sentAt', 'updatedAt', 'createdAt');
        expect(moment(invitation.createdAt).isValid()).to.be.true;
        expect(moment(invitation.updatedAt).isValid()).to.be.true;
        expect(moment(invitation.sentAt).isValid()).to.be.true;
        expect(validateUuid(invitation.uuid, 4)).to.be.true;
      });
      delete invitations[0].expiresAt; // excluded
      delete invitations[0].token; // excluded
      delete invitations[0].sentAt; // database will parse it and display is different. CHecked above for valid date/time

      delete invitations[1].expiresAt; // excluded
      delete invitations[1].token; // excluded
      delete invitations[1].sentAt; // database will parse it and display is different. CHecked above for valid date/time

      expect(response.body[0]).to.include(Object.assign({
        creatorUuid: user.get('uuid'),
        timesSent: 1,
      }, invitations[0]));
      expect(response.body[1]).to.include(Object.assign({
        creatorUuid: user.get('uuid'),
        timesSent: 1,
      }, invitations[1]));

      // should not possible to query the invitations as other user:
      const response2: any = await request(expressApp)
        .get(`${uri}?groupUuid=${group.get('uuid')}`)
        .set('Authorization', `Bearer ${differentToken}`);

      expect(response2.status).to.eq(401);
      expect(response2.body).to.deep.equal({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        status: 401,
      });

    });
  });

  describe('POST /', () => {
    it('should show error if jwt user is not the admin of the group', async () => {
      const testUser: User = await User.create({
        displayName: 'ka ching',
        email: 'kaching@gmail.com',
        firstName: 'Ka',
        lastName: 'Ching',
        roleUuid: userRole.get('uuid'),
      });

      const testGroup: Group = await Group.create({
        adminUuid: testUser.get('uuid'),
        creatorUuid: testUser.get('uuid'),
        icon: 'http://www.wengweg.nl/ewg.png',
        name: 'Groepie',
      });

      const invitation: any = {
        email: 'helemaaltof@mailinator.com',
        groupUuid: testGroup.get('uuid'),
      };

      const response: any = await request(expressApp)
        .post(`${uri}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invitation);

      expect(response.status).to.eq(401);
      expect(response.body).to.deep.equal({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should create a new invitation', async () => {
      const invitation: any = {
        email: 'loelot@mailinator.com',
        groupUuid: group.get('uuid'),
      };

      const response: any = await request(expressApp)
        .post(`${uri}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invitation);

      expect(response.status).to.eq(201);
      expect(response.body).to.include(Object.assign({
        creatorUuid: user.get('uuid'),
        timesSent: 1,
      }, invitation));
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'email', 'timesSent', 'sentAt',
        'updatedAt', 'createdAt');
      expect(moment(response.body.sentAt).isValid()).to.be.true;
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });

    it('should give an error when invitation for same email and group', async () => {
      const invitation: any = {
        email: 'loelot@mailinator.com',
        groupUuid: group.get('uuid'),
      };

      const response: any = await request(expressApp)
        .post(`${uri}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invitation);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'email must be unique', property: 'email' },
          { message: 'groupUuid must be unique', property: 'groupUuid'},
        ],
        message: 'Validation error',
        name: 'BadRequestError',
        status: 400,
      });
    });
  });

  describe('GET /:uuid', () => {
    it('should show error if jwt user is not a member of the group', async () => {
      const invite: Invitation = await Invitation.create({
        creatorUuid: user.get('uuid'),
        email: 'qghqigwh@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      });

      const response: any = await request(expressApp)
        .get(`${uri}/${invite.get('uuid')}`)
        .set('Authorization', `Bearer ${differentToken}`);

      expect(response.status).to.eq(401);
      expect(response.body).to.deep.equal({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should return a resource', async () => {
      const invite: Invitation = await Invitation.create({
        creatorUuid: user.get('uuid'),
        email: 'kekeke123@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      });

      const response: any = await request(expressApp)
        .get(`${uri}/${invite.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'email', 'timesSent', 'sentAt',
      'updatedAt', 'createdAt');
      expect(response.body).to.include({
        creatorUuid: user.get('uuid'),
        email: 'kekeke123@mailinator.com',
        groupUuid: group.get('uuid'),
        timesSent: 1,
      });
      expect(moment(response.body.sentAt).isValid()).to.be.true;
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });

    it('should return a invitation with associations', async () => {
      const invite: Invitation = await Invitation.create({
        creatorUuid: user.get('uuid'),
        email: 'lololol@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      });

      const response: any = await request(expressApp)
        .get(`${uri}/${invite.get('uuid')}?include=creator,group`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'creator', 'groupUuid', 'group', 'email', 'timesSent', 'sentAt',
      'updatedAt', 'createdAt');
      expect(response.body).to.include({
        creatorUuid: user.get('uuid'),
        email: 'lololol@mailinator.com',
        groupUuid: group.get('uuid'),
        timesSent: 1,
      });
      expect(response.body.group).to.include({
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.mooi.nl/kekeke.png',
        name: 'Groep met vrienden',
      });
      expect(response.body.creator).to.include({
        displayName: 'Henkie Tankie',
        email: 'hankietankie@gmail.com',
        firstName: 'Henkie',
        lastName: 'Tankie',
      });
      expect(moment(response.body.sentAt).isValid()).to.be.true;
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });

    it('should return an error if resource not found', async () => {
      const response: any = await request(expressApp)
        .get(`${uri}/43bbb558-8fce-43d7-9e88-faa1581fd3ee`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(404);
      expect(response.body).to.deep.equal({
        message: 'Resource not found with UUID: 43bbb558-8fce-43d7-9e88-faa1581fd3ee',
        name: 'ResourceNotFoundError',
        status: 404,
      });
    });

    it('should return an error if uuid is invalid', async () => {
      const response: any = await request(expressApp)
        .get(`${uri}/aabbcc`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(404);
      expect(response.body).to.deep.equal({
        message: 'Invalid format UUID: aabbcc',
        name: 'ResourceNotFoundError',
        status: 404,
      });
    });
  });

  describe('PUT /:uuid', () => {
    it('should show error if jwt user is not admin of the group', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'owpewkmoebrw@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const updateInv: any = {
        email: 'oerhjerh@mailinator.com',
      };

      const response: any = await request(expressApp)
        .put(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${differentToken}`)
        .send(updateInv);

      expect(response.status).to.eq(401);
      expect(response.body).to.deep.equal({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should give error on missing data', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'updatemissingdata@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const updateInv: any = {
        // no email
      };

      const response: any = await request(expressApp)
        .put(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateInv);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Invitation.email cannot be null', property: 'email' },
        ],
        message: 'Missing properties in request',
        name: 'BadRequestError',
        status: 400,
      });
    });

    it('should give error on invalid data', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'updateinvaliddata@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const updateInv: any = {
        email: 'fnd', // invalid email address
      };

      const response: any = await request(expressApp)
        .put(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateInv);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Validation isEmail on email failed', property: 'email' },
        ],
        message: 'Validation error',
        name: 'BadRequestError',
        status: 400,
      });
    });

    it('should update resource', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'updatesuccess@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const updateInv: any = {
        creatorUuid: '692f5e8a-accd-4969-b6f1-bcb00ae7ee6d', // must be ignored
        email: 'updatemewehj@mailinator.com',
        expiresAt: moment.now(), // must be ignored
        groupUuid: '33850f7f-0eb4-4166-a6db-46b0ea4d1a7d', // must be ignored
        sentAt: moment.now(), // must be ignored
        timesSent: 1, // must be ignored
        token: 'lolol', // must be ignored
        uuid: 'c284a84b-8f8f-4ef3-8c5b-a8264346b29a', // must be ignored
      };

      const response: any = await request(expressApp)
        .put(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateInv);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'email', 'timesSent', 'sentAt',
      'updatedAt', 'createdAt');
      expect(response.body).to.include({
        creatorUuid: user.get('uuid'),
        email: 'updatemewehj@mailinator.com',
        groupUuid: group.get('uuid'),
        timesSent: 1,
      });
      expect(response.body.uuid).to.eq(resource.get('uuid'));
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(moment(response.body.sentAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });
  });

  describe('PATCH /:uuid', () => {
    it('should show error if jwt user is not admin of the group', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'patewgewgess@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const patchInv: any = {
        email: 'mcewgbewwebwek@mailinator.com',
      };

      const response: any = await request(expressApp)
        .patch(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${differentToken}`)
        .send(patchInv);

      expect(response.status).to.eq(401);
      expect(response.body).to.deep.equal({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should give error on invalid data', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'patchinvaliddata@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const patchInv: any = {
        email: 'qwer', // invalid email address
      };

      const response: any = await request(expressApp)
        .patch(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(patchInv);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Validation isEmail on email failed', property: 'email' },
        ],
        message: 'Validation error',
        name: 'BadRequestError',
        status: 400,
      });
    });

    it('should patch resource', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'patchsuccess@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const patchInv: any = {
        creatorUuid: '692f5e8a-accd-4969-b6f1-bcb00ae7ee6d', // must be ignored
        email: 'patchmewehj@mailinator.com',
        expiresAt: moment.now(), // must be ignored
        groupUuid: '33850f7f-0eb4-4166-a6db-46b0ea4d1a7d', // must be ignored
        sentAt: moment.now(), // must be ignored
        timesSent: 1, // must be ignored
        token: 'lololx', // must be ignored
        uuid: 'c284a84b-8f8f-4ef3-8c5b-a8264346b29a', // must be ignored
      };

      const response: any = await request(expressApp)
        .patch(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(patchInv);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'email', 'timesSent', 'sentAt',
      'updatedAt', 'createdAt');
      expect(response.body).to.include({
        creatorUuid: user.get('uuid'),
        email: 'patchmewehj@mailinator.com',
        groupUuid: group.get('uuid'),
        timesSent: 1,
      });
      expect(response.body.uuid).to.eq(resource.get('uuid'));
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(moment(response.body.sentAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });
  });

  describe('DELETE /:uuid', () => {
    it('should show error if jwt user is not admin of the group', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'deletgewgewgeme@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const response: any = await request(expressApp)
        .delete(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${differentToken}`);

      expect(response.status).to.eq(401);
      expect(response.body).to.deep.equal({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should delete group', async () => {
      const invite: any = {
        creatorUuid: user.get('uuid'),
        email: 'deleteme@mailinator.com',
        expiresAt: moment(),
        groupUuid: group.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      };

      const resource: Invitation = await Invitation.create(invite);

      const response: any = await request(expressApp)
        .delete(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(204);
      expect(response.body).to.deep.equal({});
      const test: Invitation|null = await Invitation.findByPk(resource.get('uuid'));
      expect(test).to.be.null;
    });
  });
});
