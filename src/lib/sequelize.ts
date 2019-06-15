import config from 'config';
import { Op, Sequelize } from 'sequelize';
import { logger } from './winston';

export default new Sequelize(config.get('database.name'), process.env.DB_USER as string, process.env.DB_PASS as string, {
  dialect: 'postgres',
  host: process.env.DB_HOST as string,
  operatorsAliases: Op,
  port: Number(process.env.DB_PORT),
  timezone: '+01:00',
});

// export default new Sequelize({
//   database: config.get('database.name') as string,
//   dialect: process.env.DB_DIALECT as string,
//   host: process.env.DB_HOST as string,
//   logging: (message: string): any => logger.info(message),
//   modelPaths: [`${__dirname}/../models/*.model.ts`],
//   operatorsAliases: Sequelize.Op as any,
//   password: process.env.DB_PASS as string,
//   port: Number(process.env.DB_PORT),
//   timezone: '+01:00',
//   username: process.env.DB_USER as string,
// });
