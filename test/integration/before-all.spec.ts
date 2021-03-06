import dotenv from 'dotenv';
dotenv.config();
import bluebird from 'bluebird';
import config from 'config';
import { Sequelize } from 'sequelize';
import * as models from '../../src/models';
import Role from '../../src/models/role.model';

const sequelize: Sequelize = new Sequelize(config.get('database.name'), process.env.DB_USER as string, process.env.DB_PASS as string, {
  dialect: 'postgres',
  host: process.env.DB_HOST as string,
  logging: false,
  port: Number(process.env.DB_PORT),
  timezone: '+01:00',
});

before(async () => {
  try {
    await sequelize.authenticate();

    Object.values(models).forEach((model: any) => {
      model.attach(sequelize);
    });

    Object.values(models).forEach((model: any) => {
      model.relations();
    });

    await sequelize.sync({
      force: true,
    });

    // insert roles
    const roles: any = [
      {
        name: 'admin',
        permissions: [
          'group:read',
          'group:write',
          'invitation:read',
          'invitation:write',
          'wishlist:read',
          'wishlist:write',
          'user:read',
          'user:write',
        ],
      },
      {
        name: 'user',
        permissions: [
          'group:read',
          'group:write',
          'invitation:read',
          'invitation:write',
          'wishlist:read',
          'wishlist:write',
          'user:read',
        ],
      },
      {
        name: 'guest',
        permissions: [],
      },
    ];

    await bluebird.each(roles, (role: any) => Role.create(role));
  } catch (error) {
    console.error('Before all:', {error}); // tslint:disable-line
  }
});
