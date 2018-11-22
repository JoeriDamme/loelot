import express, { Router } from 'express';
import http from 'http';
import { apiRoutes } from './routes/api.routes';

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

    const routes: IApplicationRouter[] = this.getRoutes();
    routes.forEach((route: IApplicationRouter) => this.app.use(route.path, route.middleware, route.handler));
  }

  /**
   *
   */
  public start = (): http.Server => http.createServer(this.app);

  /**
   *
   */
  private getRoutes(): IApplicationRouter[] {
    return [
      {
        handler: apiRoutes,
        middleware: [],
        path: '/api',
      },
    ];
  }
}
