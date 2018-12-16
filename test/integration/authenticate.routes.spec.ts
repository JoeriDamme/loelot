import { expect } from 'chai';
import config from 'config';
import jwt from 'jsonwebtoken';
import nock from 'nock';
import request from 'supertest';
import validateUuid from 'uuid-validate';
import App from '../../src/app';

describe('/api/auth', () => {
  const uri: string = '/api/auth';
  let expressApp: Express.Application;

  before(async () => {
    const app: App = new App();
    app.start();
    expressApp = app.getExpressApplication();
  });

  describe('GET /facebook', () => {
    it('should reply with error when no access_token in header', async () => {
      const response: any = await request(expressApp).get(`${uri}/facebook`);
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: 'You should provide access_token',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should reply with error when invalid access_token in header', async () => {
      const response: any = await request(expressApp).get(`${uri}/facebook`).set('Authorization', 'Bearer xxx');
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: 'Failed to fetch user profile',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should reply with token and user', async () => {
      nock('https://graph.facebook.com')
      .get('/v2.6/me')
      .query(true)
      .reply(200, {
        email: 'test@gmail.com',
        first_name: 'Joeri',
        id: '2113950325321971',
        last_name: 'Damme',
        name: 'Joeri Damme',
      });

      const response: any = await request(expressApp).get(`${uri}/facebook`).set('Authorization', 'Bearer iamvalid');

      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('token', 'user');
      expect(response.body.user).to.have.all.keys('uuid', 'displayName', 'email', 'firstName', 'lastName', 'roleUuid', 'updatedAt',
      'createdAt');
      expect(response.body.user).to.include({
        displayName: 'Joeri Damme',
        email: 'test@gmail.com',
        firstName: 'Joeri',
        lastName: 'Damme',
      });
      expect(validateUuid(response.body.user.uuid, 4)).to.be.true;
      const jwtRegExp: RegExp = new RegExp(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
      expect(jwtRegExp.test(response.body.token)).to.be.true;
      const decoded: any = jwt.verify(response.body.token, config.get('jwt.secret') as string);
      expect(decoded).to.have.all.keys('data', 'permissions', 'roles', 'exp', 'iat');
      expect(decoded.data).to.have.all.keys('uuid', 'displayName', 'email', 'firstName', 'lastName', 'roleUuid', 'updatedAt',
      'createdAt');
      expect(decoded.data).to.include({
        displayName: 'Joeri Damme',
        email: 'test@gmail.com',
        firstName: 'Joeri',
        lastName: 'Damme',
      });
      expect(decoded.permissions).to.deep.equal([
        'group:read',
        'group:write',
        'invitation:read',
        'invitation:write',
        'wishlist:read',
        'wishlist:write',
        'user:read',
      ]);
      expect(decoded.roles).to.deep.equal(['user']);
      expect(Number.isInteger(decoded.exp)).to.be.true;
      expect(Number.isInteger(decoded.iat)).to.be.true;
    });
  });
});
