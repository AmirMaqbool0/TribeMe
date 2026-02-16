import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import config from "../config";
import { UserAuthProvider } from "../models/member/auth/user-auth-provider.models";
import { User } from "../models/member/auth/user.models";
import { getRepository } from "typeorm";

passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: `${process.env.BASE_URL}/api/v1/auth/facebook/callback`,
      profileFields: ["id", "emails", "displayName", "name"],
      scope: ["email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Facebook Profile:", profile);
      console.log("Access Token:", accessToken);

      const userRepository = getRepository(User);
      const userAuthRepository = getRepository(UserAuthProvider);

      try {
        let userAuth = await userAuthRepository.findOne({
          where: { facebookId: profile.id },
          relations: ["user"],
        });

        if (userAuth && userAuth.user) {
          return done(null, userAuth.user);
        }

        // Handle cases where Facebook doesn't provide an email
        const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;

        let user = await userRepository.findOne({ where: { email } });

        if (!user) {
          user = new User();
          user.fullName = profile.displayName;
          user.email = email;
          // user.isEmailVerified = !!profile.emails?.[0]?.value;
          user.isEmailVerified = true;
          user.termsAgreed = true;
          await userRepository.save(user);
        }

        const newUserAuth = new UserAuthProvider();
        newUserAuth.facebookId = profile.id;
        newUserAuth.user = user;
        await userAuthRepository.save(newUserAuth);

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// import passport from "passport";
// import { Strategy as FacebookStrategy } from "passport-facebook";
// import config from "../config";
// import { UserAuthProvider } from "../models/member/auth/user-auth-provider.models";
// import { User } from "../models/member/auth/user.models";
// import { getRepository } from "typeorm";

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: config.facebook.clientID,
//       clientSecret: config.facebook.clientSecret,
//       callbackURL: `${process.env.BASE_URL}/api/v1/auth/facebook/callback`,
//       profileFields: ["id", "emails", "displayName", "name"],
//       scope: ["email"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       const userRepository = getRepository(User);
//       const userAuthRepository = getRepository(UserAuthProvider);

//       try {
//         let userAuth = await userAuthRepository.findOne({
//           where: { facebookId: profile.id },
//           relations: ["user"],
//         });

//         if (userAuth && userAuth.user) {
//           return done(null, userAuth.user);
//         }

//         const email =
//           profile.emails?.[0]?.value || `${profile.id}@facebook.com`;

//         let user = await userRepository.findOne({ where: { email } });

//         if (!user) {
//           user = new User();
//           user.fullName = profile.displayName;
//           user.email = email;
//           user.isEmailVerified = !!profile.emails?.[0]?.value;
//           await userRepository.save(user);
//         }

//         const newUserAuth = new UserAuthProvider();
//         newUserAuth.facebookId = profile.id;
//         newUserAuth.user = user;
//         await userAuthRepository.save(newUserAuth);

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user: any, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id: string, done) => {
//   const userRepository = getRepository(User);
//   try {
//     const user = await userRepository.findOne({ where: { id } });
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });
