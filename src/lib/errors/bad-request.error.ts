import ApplicationError from './application.error';

export interface IBadRequestErrors {
  message: string;
  property: string;
}

export default class BadRequestError extends ApplicationError {
  public errors: IBadRequestErrors[];

  constructor(message: string = 'Bad request', errors: IBadRequestErrors[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}
