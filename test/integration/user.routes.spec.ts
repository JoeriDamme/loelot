import { expect } from 'chai';
import request from 'supertest';
import App from '../../src/app';
import Authentication from '../../src/lib/authentication';
import Role from '../../src/models/role.model';
import User from '../../src/models/user.model';

describe('/api/v1/users', () => {
  const uri: string = '/api/v1/users';
  let expressApp: Express.Application;

  before(async () => {
    const app: App = new App();
    app.start();
    expressApp = app.getExpressApplication();
  });

  describe('GET /me', () => {
    it('should reply with error if no JWT token is set', async () => {
      const response: any = await request(expressApp).get(`${uri}/me`);
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: 'No auth token',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should reply with error if invalid token is set', async () => {
      const response: any = await request(expressApp).get(`${uri}/me`).set('Authorization', 'Bearer xxx');
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: 'jwt malformed',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should reply with error if expired token is set', async () => {
      // tslint:disable-next-line
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InV1aWQiOiIxMTVhNDI0ZS1mMGIxLTQwZGQtYTVlNS1hMDYzZmE3NTk5ZWEiLCJmaXJzdE5hbWUiOiJKb2VyaSIsImxhc3ROYW1lIjoiRGFtbWUiLCJkaXNwbGF5TmFtZSI6IkpvZXJpIERhbW1lIiwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsImNyZWF0ZWRBdCI6IjIwMTgtMTEtMjcgMjM6MTY6MjcuNDk3KzAxIiwidXBkYXRlZEF0IjoiMjAxOC0xMS0yN1QyMjoxNjoyNy40OTdaIn0sImlhdCI6MTU0MzYxNTg5MywiZXhwIjoxNTQzNjE1ODk0fQ.uH7uJWwHx5vyRl1yd51XJYu7YFHh3Hvm8VvmMBew-2Q';
      const response: any = await request(expressApp).get(`${uri}/me`).set('Authorization', `Bearer ${token}`);
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: 'jwt expired',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should reply with profile of user', async () => {
      const role: Role|null = await Role.findOne({
        where: {
          name: 'user',
        },
      });

      if (!role) {
        throw new Error('Can not find Role');
      }

      const user: User = await User.create({
        displayName: 'John Doe',
        email: 'johndoe8765@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        roleUuid: role.get('uuid'),
      });
      const token: string = await Authentication.generateJWT(user);
      const response: any = await request(expressApp).get(`${uri}/me`).set('Authorization', `Bearer ${token}`);
      expect(response.status).to.eq(200);
      expect(response.body).to.include({
        displayName: 'John Doe',
        email: 'johndoe8765@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(response.body.role).to.include({
        name: 'user',
      });
      expect(response.body).to.have.all.keys('uuid', 'displayName', 'email', 'firstName', 'lastName', 'roleUuid', 'updatedAt',
      'createdAt', 'role');
    });

    it('should reply with forbidden if no permission', async () => {
      const role: Role|null = await Role.findOne({
        where: {
          name: 'guest',
        },
      });

      if (!role) {
        throw new Error('Can not find Role');
      }

      const user: User = await User.create({
        displayName: 'Guest',
        email: 'guestuser@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        roleUuid: role.get('uuid'),
      });
      const token: string = await Authentication.generateJWT(user);
      const response: any = await request(expressApp).get(`${uri}/me`).set('Authorization', `Bearer ${token}`);
      expect(response.status).to.eq(403);
      expect(response.body).to.include({
        message: 'Forbidden',
        name: 'ForbiddenError',
        status: 403,
      });
    });
  });
});
