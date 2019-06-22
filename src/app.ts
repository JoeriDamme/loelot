import bodyParser from 'body-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response, Router } from 'express';
import httpContext from 'express-http-context';
import http from 'http';
import morgan from 'morgan';
import uniqid from 'uniqid';
import Authentication from './lib/authentication';
import ErrorHandler from './lib/error-handling';
import ApplicationError from './lib/errors/application.error';
import EndpointNotFoundError from './lib/errors/endpoint-not-found.error';
import { logger, morganOption } from './lib/winston';
import { apiRoutes } from './routes/api.routes';
import { authenticationRoutes } from './routes/authenticate.routes';
import { groupRoutes } from './routes/group.routes';
import { invitationRoutes } from './routes/invitation.routes';
import { userRoutes } from './routes/user.routes';
import { wishListRoutes } from './routes/wishlist.routes';

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
      {
        handler: groupRoutes,
        middleware: [Authentication.validateJWT],
        path: '/api/v1/groups',
      },
      {
        handler: invitationRoutes,
        middleware: [Authentication.validateJWT],
        path: '/api/v1/invitations',
      },
      {
        handler: wishListRoutes,
        middleware: [Authentication.validateJWT],
        path: '/api/v1/wishlists',
      },
    ];

    routes.forEach((route: IApplicationRouter) => this.app.use(route.path, route.middleware, route.handler));

    this.app.use((request: Request, response: Response, next: NextFunction) => {
      const error: EndpointNotFoundError = new EndpointNotFoundError();
      logger.error(`${error.status} - ${error.message} - ${request.originalUrl} - ${request.method} - ${request.ip}`);
      return response.status(error.status).json(error);
    });

    this.app.use((err: any, request: Request, response: Response, next: NextFunction) => {
      const clientError: ApplicationError = new ErrorHandler(err).getClientError(request);
      return response.status(clientError.status).json(clientError);
    });
  }

  /**
   *
   */
  private setExpressConfiguration(): void {
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(bodyParser.json());
    // Share uniqid through app, usefull for logging.
    this.app.use(httpContext.middleware);
    this.app.use((request: Request, response: Response, next: NextFunction) => {
      httpContext.set('uniqid', uniqid());
      return next();
    });
    this.app.use(morgan('combined', morganOption));

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
