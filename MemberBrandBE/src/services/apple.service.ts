import passport from "passport";
import AppleStrategy from "passport-apple";
import { User } from "../models/member/auth/user.models";
import { getRepository } from "typeorm";
import { UserAuthProvider } from "../models/member/auth/user-auth-provider.models";
import config from "../config";

passport.use(
  new AppleStrategy(
    {
      clientID: config.apple._client_ID,
      teamID: config.apple.teamID,
      keyID: config.apple.keyID,
      privateKeyLocation: config.apple.privateKeyLocation,
      callbackURL: `${process.env.BASE_URL}/api/v1/auth/apple/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      console.log("Apple Login Callback Triggered");
      console.log("Access Token:", accessToken);
      console.log("ID Token:", idToken);
      console.log("Profile:", profile);
      console.log("Request Body:", req.body);

      const userRepository = getRepository(User);
      const userAuthRepository = getRepository(UserAuthProvider);

      try {
        let userAuth = await userAuthRepository.findOne({
          where: { appleId: profile.id },
          relations: ["user"],
        });

        if (userAuth && userAuth.user) {
          return done(null, userAuth.user);
        }

        const email = profile.emails?.[0]?.value || req.body.email;

        let newUser = await userRepository.findOne({
          where: { email },
        });

        if (!newUser) {
          newUser = new User();
          newUser.fullName =
            profile.displayName || req.body.name || "Apple User";
          newUser.email = email;
          newUser.isEmailVerified = true;
          newUser.termsAgreed = true;
          await userRepository.save(newUser);
        }

        const newUserAuth = new UserAuthProvider();
        newUserAuth.appleId = profile.id;
        newUserAuth.user = newUser;
        await userAuthRepository.save(newUserAuth);

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// import passport from "passport";
// import AppleStrategy from "passport-apple";
// import { User } from "../models/member/auth/user.models";
// import { getRepository } from "typeorm";
// import { UserAuthProvider } from "../models/member/auth/user-auth-provider.models";
// import config from "../config";
// import keyPath from "dotenv";

// passport.use(
//   new AppleStrategy(
//     {
//       clientID: config.apple._client_ID,
//       teamID: config.apple.teamID,
//       keyID: config.apple.keyID,
//       privateKeyLocation: `${keyPath}`,
//       callbackURL: `${process.env.BASE_URL}/api/v1/auth/apple/callback`,
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, idToken, profile, done) => {
//       console.log("Apple Strategy Callback triggered");

//       console.log("Access Token:", accessToken);
//       console.log("Refresh Token:", refreshToken);
//       console.log("ID Token:", idToken);
//       console.log("Profile:", profile);
//       console.log("Request Body:", req.body);

//       const userRepository = getRepository(User);
//       const userAuthRepository = getRepository(UserAuthProvider);

//       try {
//         let userAuth = await userAuthRepository.findOne({
//           where: { appleId: profile.id },
//           relations: ["user"],
//         });

//         if (userAuth && userAuth.user) {
//           done(null, userAuth.user);
//         } else {
//           const email = profile.emails?.[0]?.value || req.body.email;

//           console.log("Email from profile or request body:", email);

//           let newUser = await userRepository.findOne({
//             where: { email: email },
//           });

//           if (!newUser) {
//             console.log("Creating a new user with email:", email);

//             newUser = new User();
//             newUser.fullName =
//               profile.displayName || req.body.name || "Apple User";
//             newUser.email = email;
//             newUser.isEmailVerified = true;
//             newUser.termsAgreed = true;
//             await userRepository.save(newUser);
//           }

//           const newUserAuth = new UserAuthProvider();
//           newUserAuth.appleId = profile.id;
//           newUserAuth.user = newUser;
//           await userAuthRepository.save(newUserAuth);
//           console.log(
//             "New user or existing user linked with Apple ID:",
//             newUser
//           );

//           done(null, newUser);
//         }
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );
