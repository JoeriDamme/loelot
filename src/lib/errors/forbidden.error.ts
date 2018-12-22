import ApplicationError from './application.error';

export default class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}
