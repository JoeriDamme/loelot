import ApplicationError from './application.error';

export default class ResourceNotFoundError extends ApplicationError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}
