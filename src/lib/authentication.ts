import config from 'config';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import FacebookTokenStrategy, { Profile, VerifyFunction } from 'passport-facebook-token';
import { ExtractJwt, Strategy as JWTStrategy, VerifiedCallback } from 'passport-jwt';
import Role from '../models/role.model';
import User from '../models/user.model';
import ApplicationError from './errors/application.error';
import UnauthorizedError from './errors/unauthorized.error';

interface IJWTPayload {
  data: {
    uuid: string;
  };
  roles: string[];
  permissions: string[];
}

/**
 * Class to provide authentication
 */
export default class Authentication {
  /**
   * Generate JWT token with user data.
   * @param userData
   */
  public static async generateJWT(user: User): Promise<string> {
    const role: Role|null = await Role.findByPk(user.get('roleUuid'));

    if (!role) {
      throw new ApplicationError('Could not find Role for generating token');
    }

    return jwt.sign({
      data: user.toJSON(),
      permissions: role.get('permissions'),
      roles: [role.get('name')],
    }, Authentication.getJWTSecret(), {
      expiresIn: '4w',
    });
  }

  public static validateJWT(request: Request, response: Response, next: NextFunction): void {
    return passport.authenticate('jwt', {
      session : false,
    }, (error: Error, user: User, info: any) => {
      if (error) {
        const unauthorized: UnauthorizedError = new UnauthorizedError(error.message);
        return response.status(unauthorized.status).json(unauthorized);
      } else if (info) {
        const unauthorized: UnauthorizedError = new UnauthorizedError(info.message);
        return response.status(unauthorized.status).json(unauthorized);
      }
      request.user = user;
      return next();
    })(request, response, next);
  }

  /**
   * Return JWT secret based on environment.
   */
  private static getJWTSecret(): string {
    // when not in production, use the one in the config file. Easier for debugging.
    if (process.env.NODE_ENV !== 'production') {
      return config.get('jwt.secret');
    }

    const secret: string = process.env.JWT_SECRET || config.get('jwt.secret');
    if (!process.env.JWT_SECRET) {
      // TODO: logger warning
    }

    return secret;
  }

  public initialize(): any {
    passport.use('facebook-token', this.getFacebookTokenStrategy());
    passport.use('jwt', this.getJWTStrategy());
    return passport.initialize();
  }

  private getFacebookTokenStrategy(): FacebookTokenStrategy.StrategyInstance {
    return new FacebookTokenStrategy({
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: any): Promise<VerifyFunction> => {
      // check if User exists, or create
      try {
        const role: Role|null = await Role.findOne({
          where: {
            name: 'user',
          },
        });

        if (!role) {
          // this state should never happen
          throw new ApplicationError();
        }

        const result: [User, boolean] = await User.findOrCreate({
          defaults: {
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            roleUuid: role.get('uuid'),
          },
          where: {
            email: profile.emails[0].value,
          },
        });

        const user: User = result[0];
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    });
  }

  private getJWTStrategy(): JWTStrategy {
    return new JWTStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Authentication.getJWTSecret(),
    }, async (jwtPayload: IJWTPayload, callback: any): Promise<VerifiedCallback> => {
      try {
        const user: User|null = await User.findByPk(jwtPayload.data.uuid);

        if (!user) {
          throw new UnauthorizedError('Could not find user in token');
        }

        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    });
  }
}
