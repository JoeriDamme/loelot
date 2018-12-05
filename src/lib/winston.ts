import appRoot from 'app-root-path';
import httpContext from 'express-http-context';
import { Format, TransformableInfo } from 'logform';
import { Options } from 'morgan';
import winston, { format } from 'winston';

const timestamp: Format = format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS',
});
const messageFormat: Format = format.printf((info: TransformableInfo) => {
  return `${info.timestamp} ${httpContext.get('uniqid')} [${info.level}]: ${info.message}`.replace(/(\r\n\t|\n|\r\t)/gm, '');
});

const options: any = {
  console: {
    format: format.combine(
      format.colorize(),
      timestamp,
      messageFormat,
    ),
    handleExceptions: true,
    json: false,
    level: 'debug',
  },
  file: {
    filename: `${appRoot}/logs/app.log`,
    format: format.combine(
      timestamp,
      messageFormat,
    ),
    handleExceptions: true,
    json: true,
    level: 'info',
    maxFiles: 5,
    maxsize: 5242880,
  },
};

export const logger: winston.Logger = winston.createLogger({
  exitOnError: false,
  silent: process.env.NODE_ENV !== 'test' ? false : true,
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
});

export const morganOption: Options = {
  stream: {
    write: (message: string): any => logger.info(message)},
};
