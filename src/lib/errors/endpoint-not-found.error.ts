import ApplicationError from './application.error';

export default class EndpointNotFoundError extends ApplicationError {
  constructor(message: string = 'Endpoint not found') {
    super(message, 404);
  }
}
