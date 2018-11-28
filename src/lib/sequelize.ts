import { Sequelize } from 'sequelize-typescript';

export default new Sequelize({
  database: process.env.DB_NAME as string,
  dialect: process.env.DB_DIALECT as string,
  host: process.env.DB_HOST as string,
  modelPaths: [`${__dirname}/../models/*.model.ts`],
  operatorsAliases: Sequelize.Op as any,
  password: process.env.DB_PASS as string,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER as string,
});
