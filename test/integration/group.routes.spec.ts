import bluebird from 'bluebird';
import { expect } from 'chai';
import moment from 'moment';
import request from 'supertest';
import validateUuid from 'uuid-validate';
import App from '../../src/app';
import Authentication from '../../src/lib/authentication';
import Group from '../../src/models/group.model';
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

  describe('GET /', () => {
    it('should return all groups', async () => {
      // let's insert two groups
      const groups: any = [
        {
          adminUuid: user.get('uuid'),
          creatorUuid: user.get('uuid'),
          icon: 'http://www.kek.nl/1.png',
          name: 'Groep 1',
        },
        {
          adminUuid: user.get('uuid'),
          creatorUuid: user.get('uuid'),
          icon: 'http://www.kek.nl/2.png',
          name: 'Groep 2',
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
      });

      const resourceGroup: Group = await Group.create({
        adminUuid: user.get('uuid'),
        creatorUuid: user.get('uuid'),
        icon: 'http://www.imgur.com/test.png',
        name: 'lol',
      });

      await resourceGroup.$set('users', userNew);

      const response: any = await request(expressApp)
        .get(`${uri}?include=admin,creator,users`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.have.length(1);
      response.body.forEach((group: any) => {
        expect(group).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt', 'createdAt', 'users', 'creator', 'admin');
        expect(moment(group.createdAt).isValid()).to.be.true;
        expect(moment(group.updatedAt).isValid()).to.be.true;
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
        name: 'Hey',
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
        name: 'Hey',
      };

      const resource: Group = await Group.create(group);

      await resource.$set('users', user);

      const response: any = await request(expressApp)
        .get(`${uri}/${resource.get('uuid')}?include=admin,creator,users`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.eq(200);
      expect(response.body).to.include(group);
      expect(response.body).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt',
      'createdAt', 'admin', 'creator', 'users');
      expect(response.body.users).to.have.length(1);
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
          { message: 'Validation len on name failed', property: 'name' },
          { message: 'Validation len on icon failed', property: 'icon' },
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
          { message: 'Validation len on name failed', property: 'name' },
          { message: 'Validation len on icon failed', property: 'icon' },
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
        name: 'lol',
      };

      const resource: Group = await Group.create(group);

      const updateGroup: any = {
        adminUuid: 'dc9bdceb-8a0c-437b-ad2a-81e2ffa68807',
        creatorUuid: user.get('uuid'),
        icon: 'http://www.myicons.com/lol.png',
        name: 'testy',
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
        name: 'lol',
      };

      const resource: Group = await Group.create(group);

      const updateUser: User = await User.create({
        displayName: 'Jahn Da',
        email: 'jahnda@gmail.com',
        firstName: 'Jahn',
        lastName: 'Da',
      });

      const updateGroup: any = {
        adminUuid: updateUser.get('uuid'),
        creatorUuid: updateUser.get('uuid'),
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
      expect(response.status).to.eq(200);
      expect(response.body).to.include(updateGroup);
      expect(response.body).to.have.all.keys('uuid', 'name', 'icon', 'adminUuid', 'creatorUuid', 'updatedAt',
      'createdAt');
      expect(response.body.uuid).to.eq(resource.get('uuid'));
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
        name: 'lol',
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
        name: 'lol',
      };

      const resource: Group = await Group.create(group);

      const patchUser: User = await User.create({
        displayName: 'x y',
        email: 'xxxx@gmail.com',
        firstName: 'x',
        lastName: 'y',
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
        name: 'lol',
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
