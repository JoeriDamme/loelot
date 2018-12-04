import config from 'config';
import { Sequelize } from 'sequelize-typescript';

export default new Sequelize({
  database: config.get('database.name') as string,
  dialect: process.env.DB_DIALECT as string,
  host: process.env.DB_HOST as string,
  modelPaths: [`${__dirname}/../models/*.model.ts`],
  operatorsAliases: Sequelize.Op as any,
  password: process.env.DB_PASS as string,
  port: Number(process.env.DB_PORT),
  timezone: '+01:00',
  username: process.env.DB_USER as string,
});
