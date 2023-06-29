const User = require('../model/user');
require('dotenv').config();
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('./keys')


const cookieExtractor = (req) => {
    var token = null;
    if (req && req.signedCookies && req.signedCookies.jwt) {
        console.log("token found")
        console.log(req.signedCookies);
        token = req.signedCookies.jwt;
    }else{
        console.log("token not found");
    }
    console.log(token);
    return token;
};


const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.TOKEN
}

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(options, async(payload, done) => {
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
        User.findOne({ where : {
            id: id }}).then((user) => {
                    done(null, user);
                    return;
            }) 
        });
};