import ApplicationError from './application.error';

export default class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}
