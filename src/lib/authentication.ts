import config from 'config';
import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import passport from 'passport';
import FacebookTokenStrategy, { Profile, VerifyFunction } from 'passport-facebook-token';
import { ExtractJwt, Strategy as JWTStrategy, VerifiedCallback } from 'passport-jwt';
import User from '../models/user.model';
import UnauthorizedError from './errors/unauthorized.error';

interface IJWTPayload {
  data: {
    uuid: string;
  };
}

/**
 * Class to provide authentication
 */
export default class Authentication {
  /**
   * Generate JWT token with user data.
   * @param userData
   */
  public static generateJWT(user: User): string {
    return jwt.sign({
      data: user.toJSON(),
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
        const result: [User, boolean] = await User.findOrCreate({
          defaults: {
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
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
        const user: User|null = await User.findByPrimary(jwtPayload.data.uuid);

        if (!user) {
          throw new Error('Invalid JWT!');
        }

        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    });
  }
}
