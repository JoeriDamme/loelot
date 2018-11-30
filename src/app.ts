import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response, Router } from 'express';
import http from 'http';
import Authentication from './lib/authentication';
import ApplicationError from './lib/errors/application.error';
import EndpointNotFoundError from './lib/errors/endpoint-not-found.error';
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
  public getExpressApplication(): Express.Application {
    return this.app;
  }

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
        path: '/api/auth',
      },
      {
        handler: userRoutes,
        middleware: [Authentication.validateJWT],
        path: '/api/v1/users',
      },
    ];

    routes.forEach((route: IApplicationRouter) => this.app.use(route.path, route.middleware, route.handler));

    this.app.use((request: Request, response: Response, next: NextFunction) => {
      const error: EndpointNotFoundError = new EndpointNotFoundError();
      return response.status(error.status).json(error);
    });

    this.app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
      const expose: ApplicationError = new ApplicationError(err.message);
      return response.status(expose.status).json(expose);
    });
  }

  /**
   *
   */
  private setExpressConfiguration(): void {
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(bodyParser.json());
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
