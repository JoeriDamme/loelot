/* tslint:disable:no-console */
import config from 'config';
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import App from './app';
import sequelize from './lib/sequelize';

sequelize.authenticate().then(() => {
  const app: App = new App();
  const server: http.Server = app.start();

  const port: number = config.get('server.port');

  server.listen(port);

  server.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${port} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${port} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  server.on('listening', () => console.info(`Server is running in process ${process.pid} listening on PORT ${port}`));
}, (error: Error) => {
  // database authentication error
  console.log(error);
  process.exit(0);
});

process.on('unhandledRejection', (reason: any) => console.error('Unhandled Rejection at:', reason.stack || reason));
