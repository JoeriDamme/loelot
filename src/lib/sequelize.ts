import config from 'config';
import { Sequelize } from 'sequelize';
import { logger } from './winston';

export default new Sequelize(config.get('database.name'), process.env.DB_USER as string, process.env.DB_PASS as string, {
  dialect: 'postgres',
  host: process.env.DB_HOST as string,
  logging: (message: string): any => logger.info(message),
  port: Number(process.env.DB_PORT),
  timezone: '+01:00',
});
