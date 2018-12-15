import bluebird from 'bluebird';
import { expect } from 'chai';
import moment from 'moment';
import request from 'supertest';
import validateUuid from 'uuid-validate';
import App from '../../src/app';
import Authentication from '../../src/lib/authentication';
import Group from '../../src/models/group.model';
import User from '../../src/models/user.model';
import WishList from '../../src/models/wishlist.model';

const uri: string = '/api/v1/wishlists';

describe(uri, () => {
  let expressApp: Express.Application;
  let token: string;
  let user: User;
  let group: Group;
  let differentUser: User;
  let differentToken: string;

  before(async () => {
    const app: App = new App();
    app.start();
    expressApp = app.getExpressApplication();

    // create user for JWT token
    user = await User.create({
      displayName: 'Jantje Beton',
      email: 'jantjebeton@gmail.com',
      firstName: 'Jantje',
      lastName: 'Beton',
    });

    group = await Group.create({
      adminUuid: user.get('uuid'),
      creatorUuid: user.get('uuid'),
      icon: 'http://www.fyguhj.nl/lol.png',
      name: 'Groep met Jan en zijn vrienden',
    });

    await user.$add('groups', group);

    token = Authentication.generateJWT(user);

    differentUser = await User.create({
      displayName: 'Popie Jopie',
      email: 'popiejopie@gmail.com',
      firstName: 'Popie',
      lastName: 'Jopie',
    });

    differentToken = Authentication.generateJWT(differentUser);
  });

  describe('GET /', () => {
    it('should get all wish lists', async () => {
      const wishlists: any = [
        {
          creatorUuid: user.get('uuid'),
          description: 'productje 1',
          groupUuid: group.get('uuid'),
          rank: 1,
        },
        {
          creatorUuid: user.get('uuid'),
          description: 'productje 2',
          groupUuid: group.get('uuid'),
          rank: 2,
        },
      ];

      await bluebird.each(wishlists, async (wishlistItem: any) => WishList.create(wishlistItem));

      const response: any = await request(expressApp)
        .get(`${uri}?groupUuid=${group.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.length(2);
      response.body.forEach((wishlistItem: any) => {
        expect(wishlistItem).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'rank', 'description', 'updatedAt', 'createdAt');
        expect(moment(wishlistItem.createdAt).isValid()).to.be.true;
        expect(moment(wishlistItem.updatedAt).isValid()).to.be.true;
        expect(validateUuid(wishlistItem.uuid, 4)).to.be.true;
      });
    });

  });

  describe('POST /', () => {
    it('should create a new wist list item', async () => {
      const wishlistPost: any = {
        creatorUuid: user.get('uuid'),
        description: 'papieren vliegtuig',
        groupUuid: group.get('uuid'),
        rank: 3,
      };

      const response: any = await request(expressApp)
        .post(`${uri}`)
        .set('Authorization', `Bearer ${token}`)
        .send(wishlistPost);

      expect(response.status).to.eq(201);
      expect(response.body).to.include(Object.assign({
        creatorUuid: user.get('uuid'),
      }, wishlistPost));
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'description', 'rank', 'updatedAt', 'createdAt');
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });
  });

  describe('GET /:uuid', () => {
    it('should show error if jwt user is not a member of the group', async () => {
      const wishlist: WishList = await WishList.create({
        creatorUuid: user.get('uuid'),
        description: 'hoedje',
        groupUuid: group.get('uuid'),
        rank: 1,
      });

      const response: any = await request(expressApp)
        .get(`${uri}/${wishlist.get('uuid')}`)
        .set('Authorization', `Bearer ${differentToken}`);

      expect(response.status).to.eq(401);
      expect(response.body).to.deep.equal({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        status: 401,
      });
    });

    it('should return a resource', async () => {
      const wishlist: WishList = await WishList.create({
        creatorUuid: user.get('uuid'),
        description: 'bal',
        groupUuid: group.get('uuid'),
        rank: 2,
      });

      const response: any = await request(expressApp)
        .get(`${uri}/${wishlist.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'description', 'rank', 'updatedAt', 'createdAt');
      expect(response.body).to.include({
        creatorUuid: user.get('uuid'),
        description: 'bal',
        groupUuid: group.get('uuid'),
        rank: 2,
        uuid: wishlist.get('uuid'),
      });
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });

    it('should return a invitation with associations', async () => {
      const wishlist: WishList = await WishList.create({
        creatorUuid: user.get('uuid'),
        description: 'tol',
        groupUuid: group.get('uuid'),
        rank: 10,
      });

      const response: any = await request(expressApp)
        .get(`${uri}/${wishlist.get('uuid')}?include=creator,group`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('uuid', 'creator', 'creatorUuid', 'groupUuid', 'group', 'description', 'rank', 'updatedAt', 'createdAt');
      expect(response.body).to.include({
        creatorUuid: user.get('uuid'),
        description: 'tol',
        groupUuid: group.get('uuid'),
        rank: 10,
        uuid: wishlist.get('uuid'),
      });
      expect(response.body.group).to.include({
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.fyguhj.nl/lol.png',
        name: 'Groep met Jan en zijn vrienden',
        uuid: group.get('uuid'),
      });
      expect(response.body.creator).to.include({
        displayName: 'Jantje Beton',
        email: 'jantjebeton@gmail.com',
        firstName: 'Jantje',
        lastName: 'Beton',
        uuid: user.get('uuid'),
      });
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
});
