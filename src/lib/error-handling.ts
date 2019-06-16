import { Request } from 'express';
import SequelizeValidationError from 'sequelize';
import { logger } from '../lib/winston';
import ApplicationError from './errors/application.error';
import BadRequestError, { IBadRequestErrors } from './errors/bad-request.error';

export default class ErrorHandler {
  public error: any;

  constructor(error: any) {
    this.error = error;
  }

  public getClientError(request: Request): ApplicationError {
    let handledError: ApplicationError;
    if (this.error instanceof SequelizeValidationError.ValidationError) {
      handledError =  new BadRequestError('Validation error', this.getErrorsSequelizeValidationError());
    } else if (this.error instanceof SequelizeValidationError.ForeignKeyConstraintError) {
      handledError = new BadRequestError('Validation error', this.getErrorsSequelizeConstraintError());
    } else if (this.error instanceof ApplicationError) {
      // the error has already been handled
      handledError = this.error;
    } else {
      handledError = new ApplicationError('Something went wrong. Please try again');
    }

    logger.error(`${handledError.status} - ${this.error.message} - ${this.error.stack} - ${request.originalUrl} - ${request.method} - ${request.ip}`);

    return handledError;
  }

  private getErrorsSequelizeValidationError(): IBadRequestErrors[] {
    const sequelizeValidationError: any = JSON.parse(JSON.stringify(this.error));
    return sequelizeValidationError.errors.map((e: any) => Object.assign({}, {
      message: e.message,
      property: e.path,
    }));
  }

  private getErrorsSequelizeConstraintError(): IBadRequestErrors[] {
    const sequelizeConstraintError: any = JSON.parse(JSON.stringify(this.error));
    return [{
      message: 'Unknown UUID',
      property: sequelizeConstraintError.parent.detail.split('(')[1].split(')')[0],
    }];
  }
}
