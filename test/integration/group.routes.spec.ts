import bluebird from 'bluebird';
import { expect } from 'chai';
import Crypto from 'crypto';
import moment from 'moment';
import request from 'supertest';
import validateUuid from 'uuid-validate';
import App from '../../src/app';
import Authentication from '../../src/lib/authentication';
import Group from '../../src/models/group.model';
import GroupUser from '../../src/models/groupuser.model';
import Invitation from '../../src/models/invitation.model';
import Role from '../../src/models/role.model';
import User from '../../src/models/user.model';
import WishList from '../../src/models/wishlist.model';

const uri: string = '/api/v1/groups';

describe(uri, () => {
  let expressApp: Express.Application;
  let user: User;
  let guest: User;
  let token: string;
  let guestToken: string;
  let userRole: Role;
  let guestRole: Role;

  before(async () => {
    const app: App = new App();
    app.start();
    expressApp = app.getExpressApplication();

    const roles: Role[] = await Role.findAll();

    userRole = roles.filter((role: Role) => role.get('name') === 'user')[0];
    guestRole = roles.filter((role: Role) => role.get('name') === 'guest')[0];

    // create user for JWT token
    user = await User.create({
      displayName: 'John Doe',
      email: 'johndoe@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
      roleUuid: userRole.get('uuid'),
    });

    token = await Authentication.generateJWT(user);

    guest = await User.create({
      displayName: 'Guest User',
      email: 'guestuser1@mailinator.com',
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

    it('should return all groups', async () => {
      // let's insert two groups
      const groups: any = [
        {
          adminUuid: user.get('uuid'),
          creatorUuid: user.get('uuid'),
          icon: 'http://www.kek.nl/1.png',
          name: 'Groep 1 test',
        },
        {
          adminUuid: user.get('uuid'),
          creatorUuid: user.get('uuid'),
          icon: 'http://www.kek.nl/2.png',
          name: 'Groep 2 test',
        },
      ];

      await bluebird.each(groups, async (group: any) => Group.create(group));

      const response: any = await request(expressApp)
        .get(`${uri}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.length(2);
      response.body.forEach((group: any) => {
        expect(group).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt', 'createdAt');
        expect(moment(group.createdAt).isValid()).to.be.true;
        expect(moment(group.updatedAt).isValid()).to.be.true;
        expect(validateUuid(group.uuid, 4)).to.be.true;
      });
      expect(response.body[0]).to.include(Object.assign({
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
      }, groups[0]));
      expect(response.body[1]).to.include(Object.assign({
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
      }, groups[1]));
    });

    it('should return all groups with associations', async () => {
      const groups: Group[] = await Group.findAll();
      await bluebird.each(groups, async (group: Group) => group.destroy());

      const userNew: User = await User.create({
        displayName: 'xx yx',
        email: 'ownrinor@gmail.com',
        firstName: 'xx',
        lastName: 'yx',
        roleUuid: userRole.get('uuid'),
      });

      const resourceGroup: Group = await Group.create({
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.imgur.com/test.png',
        name: 'lollol',
      });

      await resourceGroup.addUser(userNew);

      const invitation: Invitation = await Invitation.create({
        creatorUuid: userNew.get('uuid'),
        email: 'hey@mailinator.com',
        expiresAt: moment(),
        groupUuid: resourceGroup.get('uuid'),
        sentAt: moment(),
        timesSent: 1,
        token: Crypto.randomBytes(48).toString('hex'),
      });

      const wishList: WishList = await WishList.create({
        creatorUuid: userNew.get('uuid'),
        description: 'productje 1',
        groupUuid: resourceGroup.get('uuid'),
        rank: 1,
      });

      const response: any = await request(expressApp)
        .get(`${uri}?include=admin,creator,users,wishLists,invitations`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.length(1);
      response.body.forEach((group: any) => {
        expect(group).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt', 'createdAt',
          'users', 'creator', 'admin', 'invitations', 'wishLists');
        expect(group.users).to.have.length(1);
        expect(group.users[0]).to.include({
          displayName: 'xx yx',
          email: 'ownrinor@gmail.com',
          firstName: 'xx',
          lastName: 'yx',
          uuid: userNew.get('uuid'),
        });
        expect(group.admin).to.include({
          displayName: 'John Doe',
          email: 'johndoe@gmail.com',
          firstName: 'John',
          lastName: 'Doe',
          uuid: user.get('uuid'),
        });
        expect(group.creator).to.include({
          displayName: 'John Doe',
          email: 'johndoe@gmail.com',
          firstName: 'John',
          lastName: 'Doe',
          uuid: user.get('uuid'),
        });
        expect(group.invitations).to.have.length(1);
        expect(group.invitations[0]).to.include({
          email: 'hey@mailinator.com',
          timesSent: 1,
          uuid: invitation.get('uuid'),
        });
        expect(group.wishLists).to.have.length(1);
        expect(group.wishLists[0]).to.include({
          description: 'productje 1',
          rank: 1,
          uuid: wishList.get('uuid'),
        });
        expect(moment(group.createdAt).isValid()).to.be.true;
        expect(moment(group.updatedAt).isValid()).to.be.true;
        expect(group.uuid).to.eq(resourceGroup.get('uuid'));
        expect(validateUuid(group.uuid, 4)).to.be.true;
      });

    });
  });

  describe('GET /:uuid', () => {
    it('should return a resource', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.lol.nl/4.png',
        name: 'Heylol',
      };

      const resource: Group = await Group.create(group);

      const response: any = await request(expressApp)
        .get(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.include(group);
      expect(response.body).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt',
      'createdAt');
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });

    it('should return a resource with associations', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.lol.nl/4.png',
        name: 'Heylol',
      };

      const resource: Group = await Group.create(group);

      await resource.addUser(user);

      const response: any = await request(expressApp)
        .get(`${uri}/${resource.get('uuid')}?include=admin,creator,users`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt',
      'createdAt', 'admin', 'creator', 'users');
      expect(response.body).to.include(group);
      expect(response.body.users).to.have.length(1);
      expect(response.body.users[0]).to.include({
        displayName: 'John Doe',
        email: 'johndoe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(response.body.admin).to.include({
        displayName: 'John Doe',
        email: 'johndoe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(response.body.creator).to.include({
        displayName: 'John Doe',
        email: 'johndoe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
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

  describe('POST /', () => {
    it('should ignore data and uuid ', async () => {
      const group: any = {
        icon: 'http://www.lol.nl/kek.png',
        name: 'Mijn Groep',
        uuid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', // should be generated
        what: 'ewgh',
      };

      const response: any = await request(expressApp)
        .post(`${uri}`)
        .set('Authorization', `Bearer ${token}`)
        .send(group);

      delete group.uuid;
      delete group.what;
      expect(response.status).to.eq(201);
      expect(response.body).to.include(Object.assign({
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
      }, group));
      expect(response.body).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt',
        'createdAt');
      expect(response.body.uuid).to.not.equal('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;

      // check if relationship is set in database between users and group
      const check: GroupUser[] = await GroupUser.findAll({
        where: {
          groupUuid: response.body.uuid,
          userUuid: user.get('uuid'),
        },
      });
      expect(check).to.have.length(1);
    });

    it('should reply with error if data is invalid', async () => {
      const group: any = {
        icon: 'x'.repeat(300),
        name: 'y'.repeat(50),
      };

      const response: any = await request(expressApp)
        .post(`${uri}`)
        .set('Authorization', `Bearer ${token}`)
        .send(group);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Validation len on icon failed', property: 'icon' },
          { message: 'Validation len on name failed', property: 'name' },
        ],
        message: 'Validation error',
        name: 'BadRequestError',
        status: 400,
      });
    });

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
      expect(validateUuid(response.body.uuid, 4)).to.be.true;

      // check if relationship is set in database between users and group
      const check: GroupUser[] = await GroupUser.findAll({
        where: {
          groupUuid: response.body.uuid,
          userUuid: user.get('uuid'),
        },
      });
      expect(check).to.have.length(1);
    });
  });

  describe('PUT /:uuid', () => {
    it('should give error on missing data', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.keke.com/test.png',
        name: 'the name',
      };

      const resource: Group = await Group.create(group);

      const updateGroup: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'ppp',
      };

      const response: any = await request(expressApp)
        .put(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateGroup);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Group.name cannot be null', property: 'name' },
        ],
        message: 'Missing properties in request',
        name: 'BadRequestError',
        status: 400,
      });
    });

    it('should give error on invalid data', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.keke.com/test.png',
        name: 'the name',
      };

      const resource: Group = await Group.create(group);

      const updateGroup: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'p'.repeat(300),
        name: 'x'.repeat(60),
      };

      const response: any = await request(expressApp)
        .put(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateGroup);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Validation len on icon failed', property: 'icon' },
          { message: 'Validation len on name failed', property: 'name' },
        ],
        message: 'Validation error',
        name: 'BadRequestError',
        status: 400,
      });
    });

    it('should give error on invalid foreign key', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.imgur.com/test.png',
        name: 'lolpop',
      };

      const resource: Group = await Group.create(group);

      const updateGroup: any = {
        adminUuid: 'dc9bdceb-8a0c-437b-ad2a-81e2ffa68807',
        creatorUuid: user.get('uuid'),
        icon: 'http://www.myicons.com/lol.png',
        name: 'testywg',
      };

      const response: any = await request(expressApp)
        .put(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateGroup);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Unknown UUID', property: 'adminUuid' },
        ],
        message: 'Validation error',
        name: 'BadRequestError',
        status: 400,
      });
    });

    it('should update resource', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.imgur.com/test.png',
        name: 'loltopx',
      };

      const resource: Group = await Group.create(group);

      const updateUser: User = await User.create({
        displayName: 'Jahn Da',
        email: 'jahnda@gmail.com',
        firstName: 'Jahn',
        lastName: 'Da',
        roleUuid: userRole.get('uuid'),
      });

      const updateGroup: any = {
        adminUuid: updateUser.get('uuid'),
        creatorUuid: updateUser.get('uuid'), // should be ignored
        icon: 'http://www.imgur.com/new.jpg',
        name: 'new lol',
        uuid: '2f9db767-3019-4120-a07e-1d79da925021', // should be ignored
        zork: 'bork', // should be ignored
      };

      const response: any = await request(expressApp)
        .put(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateGroup);

      delete updateGroup.zork;
      delete updateGroup.uuid;
      delete updateGroup.creatorUuid;
      expect(response.status).to.eq(200);
      expect(response.body).to.include(updateGroup);
      expect(response.body).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt',
      'createdAt');
      expect(response.body.uuid).to.eq(resource.get('uuid'));
      expect(response.body.creatorUuid).to.eq(resource.get('creatorUuid'));
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });
  });

  describe('PATCH /:uuid', () => {

    it('should give error on invalid data', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.keke.com/test.png',
        name: 'the name',
      };

      const resource: Group = await Group.create(group);

      const updateGroup: any = {
        name: 'u'.repeat(60),
      };

      const response: any = await request(expressApp)
        .patch(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateGroup);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Validation len on name failed', property: 'name' },
        ],
        message: 'Validation error',
        name: 'BadRequestError',
        status: 400,
      });
    });

    it('should give error on invalid foreign key', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.imgur.com/test.png',
        name: 'lol keppel x',
      };

      const resource: Group = await Group.create(group);

      const updateGroup: any = {
        adminUuid: 'dc9bdceb-8a0c-437b-ad2a-81e2ffa68807',
      };

      const response: any = await request(expressApp)
        .patch(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateGroup);

      expect(response.status).to.eq(400);
      expect(response.body).to.deep.equal({
        errors: [
          { message: 'Unknown UUID', property: 'adminUuid' },
        ],
        message: 'Validation error',
        name: 'BadRequestError',
        status: 400,
      });
    });

    it('should patch resource', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.x.com/blob.png',
        name: 'lol politie',
      };

      const resource: Group = await Group.create(group);

      const patchUser: User = await User.create({
        displayName: 'x y',
        email: 'xxxx@gmail.com',
        firstName: 'x',
        lastName: 'y',
        roleUuid: userRole.get('uuid'),
      });

      const updateGroup: any = {
        adminUuid: patchUser.get('uuid'),
        name: 'new name',
        uuid: '2f9db767-3019-4120-a07e-1d79da925021', // should be ignored
        zork: 'bork', // should be ignored
      };

      const response: any = await request(expressApp)
        .patch(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateGroup);

      delete updateGroup.zork;
      const test: object = Object.assign({}, group, updateGroup, {
        uuid: resource.get('uuid'),
      });

      expect(response.status).to.eq(200);
      expect(response.body).to.include(test);
      expect(response.body).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt',
      'createdAt');
      expect(response.body.uuid).to.eq(resource.get('uuid'));
      expect(moment(response.body.createdAt).isValid()).to.be.true;
      expect(moment(response.body.updatedAt).isValid()).to.be.true;
      expect(validateUuid(response.body.uuid, 4)).to.be.true;
    });
  });

  describe('DELETE /:uuid', () => {
    it('should delete group', async () => {
      const group: any = {
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.x.com/egewg.png',
        name: 'mooi man',
      };

      const resource: Group = await Group.create(group);

      const response: any = await request(expressApp)
        .delete(`${uri}/${resource.get('uuid')}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(204);
      expect(response.body).to.deep.equal({});
      const test: Group|null = await Group.findByPk(resource.get('uuid'));
      expect(test).to.be.null;
    });
  });
});
