const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStragegy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStragegy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      // it will execute before redirect
      User.findOne({ googleId: profile.id }).then((currUser) => {
        if (currUser) {
          done(null, currUser);
        }
      });
      const index = profile.displayName.indexOf("(");
      const username = profile.displayName.slice(0, index).replace(/\s+/g, "");
      User.create({
        googleId: profile.id,
        name: username,
        email: profile.emails[0].value,
      }).then((user) => {
        done(null, user);
      });
    },
  ),
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/github/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      // it will execute before redirect
      User.findOne({ githubId: profile.id }).then((currUser) => {
        if (currUser) {
          done(null, currUser);
        }
      });
      User.create({
        githubId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      }).then((user) => {
        done(null, user);
      });
    },
  ),
);
