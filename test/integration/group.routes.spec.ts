import { expect } from 'chai';
import moment from 'moment';
import request from 'supertest';
import App from '../../src/app';
import Authentication from '../../src/lib/authentication';
import User from '../../src/models/user.model';

const uri: string = '/api/v1/groups';

describe(uri, () => {
  let expressApp: Express.Application;
  let user: User;
  let token: string;

  before(async () => {
    const app: App = new App();
    app.start();
    expressApp = app.getExpressApplication();

    // create user for JWT token
    user = await User.create({
      displayName: 'John Doe',
      email: 'johndoe@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
    });

    token = Authentication.generateJWT(user);
  });

  describe('POST /', () => {
    it('should reply with new resource', async () => {
      const group: any = {
        icon: 'http://www.test.com/img.png',
        name: 'new group',
      };

      const response: any = await request(expressApp)
        .post(`${uri}`)
        .set('Authorization', `Bearer ${token}`)
        .send(group);

      expect(response.status).to.eq(201);
      expect(response.body).to.include(Object.assign({
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
      }, group));
      expect(response.body).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt',
      'createdAt');
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
    });
  });
});
