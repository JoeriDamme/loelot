import { expect } from 'chai';
import moment from 'moment';
import request from 'supertest';
import validateUuid from 'uuid-validate';
import App from '../../src/app';
import Authentication from '../../src/lib/authentication';
import Group from '../../src/models/group.model';
import Invitation from '../../src/models/invitation.model';
import User from '../../src/models/user.model';

const uri: string = '/api/v1/invitations';

describe.only(uri, () => {
  let expressApp: Express.Application;
  let token: string;
  let user: User;
  let group: Group;

  before(async () => {
    const app: App = new App();
    app.start();
    expressApp = app.getExpressApplication();

    // create user for JWT token
    user = await User.create({
      displayName: 'Henkie Tankie',
      email: 'hankietankie@gmail.com',
      firstName: 'Henkie',
      lastName: 'Tankie',
    });

    group = await Group.create({
      adminUuid: user.get('uuid'),
      creatorUuid: user.get('uuid'),
      icon: 'http://www.mooi.nl/kekeke.png',
      name: 'Groep met vrienden',
    });

    await user.$add('groups', group);

    token = Authentication.generateJWT(user);
  });

  describe('POST /', () => {
    it('should show error if jwt user is not the admin of the group', async () => {
      const testUser: User = await User.create({
        displayName: 'ka ching',
        email: 'kaching@gmail.com',
        firstName: 'Ka',
        lastName: 'Ching',
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
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'email', 'timesSent', 'sentAt', 'updatedAt', 'createdAt');
      expect(moment(response.body.sentAt).isValid()).to.be.true;
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });
  });
});
