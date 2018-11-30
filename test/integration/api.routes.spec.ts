import { expect } from 'chai';
import request from 'supertest';
import App from '../../src/app';

describe('/api', () => {
  const uri: string = '/api';
  let expressApp: Express.Application;

  before(async () => {
    const app: App = new App();
    app.start();
    expressApp = app.getExpressApplication();
  });

  describe('GET /', () => {
    it('should reply with status ok', async () => {
      const response: any = await request(expressApp).get(`${uri}`);
      expect(response.status).to.eq(200);
      expect(response.body).to.deep.equal({
        status: 'ok',
      });
    });
  });
});
