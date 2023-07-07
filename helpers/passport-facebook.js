require("dotenv").config();

const passport = require('passport');
const facebookTokenStrategy = require('passport-facebook');
// const User = require('../models/user');
module.exports = function () {
    // passport.use('facebookToken', new facebookTokenStrategy({
    //     clientID: process.env.FACEBOOK_APP_ID,
    //     clientSecret: process.env.FACEBOOK_APP_SECRET
    // }, async (accessToken, refreshToken, profile, done) => {
    //     try {

    //         const existingUser = await User.findOne({ 'facebook.id': profile.id });

    //         if(existingUser) {
    //             return done(null, existingUser);
    //         }

    //         const newUser = new User({
    //             method: 'facebook',
    //             facebook: {
    //                 id: profile.id,
    //                 email: profile.emails[0].value,
    //                 token: accessToken
    //             }
    //         });

    //         await newUser.save();
    //         done(null, newUser);

    //     } catch(error) {
    //         done(error, false);
    //     }
    // }));

    passport.use(new facebookTokenStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        // callbackURL: "http://localhost:3000/auth/facebook/callback"
      },
      function(accessToken, refreshToken, profile, cb) {
        console.log(profile)
        // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        //   return cb(err, user);
        // });
      }
    ));
};
