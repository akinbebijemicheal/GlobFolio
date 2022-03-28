const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { session, store } = require('./model/session');
require('dotenv').config();
const passport = require('passport');
const cookieParser = require('cookie-parser');
//const cookieEncrypter = require('cookie-encrypter')
const router = require('./routes/routes');


app.use(cookieParser(process.env.CSECRET));
//app.use(cookieEncrypter(process.env.CSECRET));
app.use(
    session({
        secret: process.env.SECRET,
        store: store,
        saveUninitialized: true,
        resave: true,
        cookie: {
            secure: true,
            httpOnly: true,
            sameSite: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
require('./middleware/passport')(passport);
app.use('/', router);




module.exports = app;