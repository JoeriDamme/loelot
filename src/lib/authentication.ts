import passport from 'passport';
import FacebookTokenStrategy, { Profile, VerifyFunction } from 'passport-facebook-token';
import User from '../models/user.model';

/**
 * Class to provide authentication
 */
export default class Authentication {
  public initialize(): any {
    passport.use('facebook-token', this.getFacebookTokenStrategy());
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
}
