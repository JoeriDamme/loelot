import appRoot from 'app-root-path';
import { Options } from 'morgan';
import winston from 'winston';

const options: any = {
  console: {
    colorize: true,
    handleExceptions: true,
    json: false,
    level: 'debug',
  },
  file: {
    colorize: false,
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    level: 'info',
    maxFiles: 5,
    maxsize: 5242880, // 5MB
  },
};

export const logger: winston.Logger = winston.createLogger({
  exitOnError: false, // do not exit on handled exceptions
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
});

export const morganOption: Options = {
  stream: {
    write: (message: string): any => {
      logger.info(message);
    },
  },
};
