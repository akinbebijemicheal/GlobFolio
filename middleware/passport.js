const User = require('../model/user');
require('dotenv').config();
const { Strategy} = require('passport-jwt');

const cookieExtractor = (req) => {
    var token = null;
    if (req && req.signedCookies && req.signedCookies.jwt) {
        token = req.signedCookies.jwt;
    }
    //console.log(token);
    return token;
};

const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.TOKEN
}

module.exports = (passport) => {
    passport.use(
        new Strategy(options, async(payload, done) => {
            await User.findOne({ where: 
                { 
                    id: payload.id
                }
            }).then(user => {
            if(user){
                done(null, user);
                return;
            }
                done(null, false);
                return;
            
        })
        .catch(err => {
            done(null, false); 
            return;
        });
    })
    
    );
    passport.serializeUser(function (user, done) {
       done(null, user.id);
       return;
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
            return;
        });
    });
};