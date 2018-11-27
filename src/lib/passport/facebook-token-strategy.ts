import passport from 'passport';
import Strategy, { Profile, VerifyFunction } from 'passport-facebook-token';

passport.use('facebook-token', new Strategy({
  clientID: process.env.FACEBOOK_APP_ID as string,
  clientSecret: process.env.FACEBOOK_APP_SECRET as string,
}, (accessToken: string, refreshToken: string, profile: Profile, done: any): VerifyFunction => {
  return done();
}));
