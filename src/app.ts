import express, { Router } from 'express';
import http from 'http';
import passport from 'passport';
import Authentication from './lib/authentication';
import { apiRoutes } from './routes/api.routes';
import { authenticationRoutes } from './routes/authenticate.routes';
import { userRoutes } from './routes/user.routes';

interface IApplicationRouter {
  handler: Router;
  middleware: any[];
  path: string;
}

export default class App {
  private app: express.Application;

  /**
   *
   */
  constructor() {
    this.app = express();

    this.setExpressConfiguration();
    this.setPassportConfiguration();
    this.setRoutes();
  }

  /**
   *
   */
  public start = (): http.Server => http.createServer(this.app);

  /**
   *
   */
  private setRoutes(): void {
    const routes: IApplicationRouter[] = [
      {
        handler: apiRoutes,
        middleware: [],
        path: '/api',
      },
      {
        handler: authenticationRoutes,
        middleware: [],
        path: '/api',
      },
      {
        handler: userRoutes,
        middleware: [Authentication.validateJWT],
        path: '/api/v1/users',
      },
    ];

    routes.forEach((route: IApplicationRouter) => this.app.use(route.path, route.middleware, route.handler));
  }

  /**
   *
   */
  private setExpressConfiguration(): void {
    return;
  }

  /**
   *
   */
  private setPassportConfiguration(): void {
    const authentication: Authentication = new Authentication();
    this.app.use(authentication.initialize());
  }
}
