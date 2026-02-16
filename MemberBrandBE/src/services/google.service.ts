import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/member/auth/user.models";
import { getRepository } from "typeorm";
import { UserAuthProvider } from "../models/member/auth/user-auth-provider.models";
import config from "../config";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`,
      scope: ["openid", "profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const userRepository = getRepository(User);
      const userAuthRepository = getRepository(UserAuthProvider);

      try {
        //check if user already exists via google id
        let userAuth = await userAuthRepository.findOne({
          where: { googleId: profile.id },
          relations: ["user"],
        });
        console.log("userAuth", userAuth);

        //if user already exists via google id, return the user
        if (userAuth && userAuth.user) {
          console.log("user already exists via google id, return the user");
          return done(null, userAuth.user);
        }

        //if user exist via email, return the user
        let existingUser = await userRepository.findOne({
          where: { email: profile.emails[0].value },
          relations: ["selectedBrands"],
        });
        console.log("user exist via email, returning the user");
        console.log("user", existingUser);

        //if user exist but not via google, link google account to user
        if (existingUser) {
          console.log(
            "user exist but not via google, link google account to user"
          );
          userAuth = new UserAuthProvider();
          userAuth.googleId = profile.id;
          userAuth.user = existingUser;
          await userAuthRepository.save(userAuth);
          return done(null, existingUser);
        }

        //create new user
        const newUser = new User();
        newUser.fullName = profile.displayName;
        newUser.email = profile.emails[0].value;
        newUser.isEmailVerified = true;
        newUser.termsAgreed = true;

        await userRepository.save(newUser);

        //create new user auth provider
        userAuth = new UserAuthProvider();
        userAuth.googleId = profile.id;
        userAuth.user = newUser;
        await userAuthRepository.save(userAuth);

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
