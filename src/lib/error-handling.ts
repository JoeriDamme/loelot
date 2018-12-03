import SequelizeValidationError from 'sequelize';
import ApplicationError from './errors/application.error';
import BadRequestError, { IBadRequestErrors } from './errors/bad-request.error';

export default class ErrorHandler {
  public error: Error;

  constructor(error: Error) {
    this.error = error;
    console.error(this.error); // tslint:disable-line
  }

  public getClientError(): ApplicationError {
    if (this.error instanceof SequelizeValidationError.ValidationError) {
      return new BadRequestError('Validation error', this.getErrorsSequelizeValidationError());
    }
    return new ApplicationError('Something went wrong. Please try again');
  }

  private getErrorsSequelizeValidationError(): IBadRequestErrors[] {
    const sequelizeValidationError: any = JSON.parse(JSON.stringify(this.error));
    return sequelizeValidationError.errors.map((e: any) => Object.assign({}, {
      message: e.message,
      property: e.path,
    }));
  }
}
