import { Request, Response, Router } from 'express';

export const apiRoutes: Router = Router()
  .get('/', (request: Request, response: Response) => response.json({
    status: 'ok',
  }));
