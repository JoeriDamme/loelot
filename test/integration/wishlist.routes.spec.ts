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

      await bluebird.each(wishlists, async (wishlist: any) => WishList.create(wishlist));

      const response: any = await request(expressApp)
        .get(`${uri}?groupUuid=${group.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.length(2);
      response.body.forEach((wishlist: any) => {
        expect(wishlist).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'rank', 'description', 'updatedAt', 'createdAt');
        expect(moment(wishlist.createdAt).isValid()).to.be.true;
        expect(moment(wishlist.updatedAt).isValid()).to.be.true;
        expect(validateUuid(wishlist.uuid, 4)).to.be.true;
      });
    });

  });

  describe('POST', () => {
    it('should create a new wist list item', async () => {
      const wishlist: any = {
        creatorUuid: user.get('uuid'),
        description: 'papieren vliegtuig',
        groupUuid: group.get('uuid'),
        rank: 3,
      };

      const response: any = await request(expressApp)
        .post(`${uri}`)
        .set('Authorization', `Bearer ${token}`)
        .send(wishlist);

      expect(response.status).to.eq(201);
      expect(response.body).to.include(Object.assign({
        creatorUuid: user.get('uuid'),
      }, wishlist));
      expect(response.body).to.have.all.keys('uuid', 'creatorUuid', 'groupUuid', 'description', 'rank', 'updatedAt', 'createdAt');
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });
  });
});
