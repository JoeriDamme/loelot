export default class ApplicationError extends Error {
  public status: number;

  constructor(message: string = 'Something went wrong. Please try again', status: number = 500) {
    super();
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
  }
}
