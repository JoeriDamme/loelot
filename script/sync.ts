import dotenv from 'dotenv';
dotenv.config();
import config from 'config';
import { Sequelize } from 'sequelize-typescript';

const sequelize: Sequelize = new Sequelize({
  database: config.get('database.name') as string,
  dialect: process.env.DB_DIALECT as string,
  host: process.env.DB_HOST as string,
  modelPaths: [`${__dirname}/../src/models/*.model.ts`],
  operatorsAliases: Sequelize.Op as any,
  password: process.env.DB_PASS as string,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER as string,
});

class Sync {
  public static async init(): Promise<void> {
    try {
      await sequelize.authenticate();
      await sequelize.sync({
        force: true,
      });
    } catch (error) {
      throw error;
    }
  }
}

Sync.init().then(() => {
  console.log('synced!'); // tslint:disable-line
  process.exit(0);
}, (err: Error) => {
  console.log(err); // tslint:disable-line
  process.exit(1);
});
