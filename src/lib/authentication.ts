import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import passport from 'passport';
import FacebookTokenStrategy, { Profile, VerifyFunction } from 'passport-facebook-token';
import { ExtractJwt, Strategy as JWTStrategy, VerifiedCallback } from 'passport-jwt';
import User from '../models/user.model';

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
    }, process.env.JWT_SECRET as Secret, {
      expiresIn: '4w',
    });
  }

  public static validateJWT(request: Request, response: Response, next: NextFunction): void {
    return passport.authenticate('jwt', { session : false })(request, response, next);
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
      secretOrKey: process.env.JWT_SECRET,
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
