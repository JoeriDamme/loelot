import bluebird from 'bluebird';
import dotenv from 'dotenv';
dotenv.config();
import config from 'config';
import { Op, Sequelize } from 'sequelize';
import Role from '../src/models/role.model';

const sequelize: Sequelize = new Sequelize(config.get('database.name'), process.env.DB_USER as string, process.env.DB_PASS as string, {
  dialect: 'postgres',
  host: process.env.DB_HOST as string,
  logging: false,
  operatorsAliases: Op,
  port: Number(process.env.DB_PORT),
  timezone: '+01:00',
});

// roles
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

class Sync {
  public static async init(): Promise<void> {
    try {
      await sequelize.authenticate();
      await sequelize.sync({
        force: true,
      });
      await Sync.createRoles();
    } catch (error) {
      throw error;
    }
  }

  public static async createRoles(): Promise<any[]> {
    return bluebird.each(roles, (role: any) => Role.create(role));
  }
}

Sync.init().then(() => {
  console.log('synced!'); // tslint:disable-line
  process.exit(0);
}, (err: Error) => {
  console.log(err); // tslint:disable-line
  process.exit(1);
});
