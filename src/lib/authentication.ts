import passport from 'passport';
import FacebookTokenStrategy, { Profile, VerifyFunction } from 'passport-facebook-token';

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
    }, (accessToken: string, refreshToken: string, profile: Profile, done: any): VerifyFunction => {
      // console.log({accessToken}, {refreshToken}, {profile});
      return done();
    });
  }
}
