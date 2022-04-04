const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
//const flash = require('connect-flash')
require('dotenv').config();
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const webrouter = require('./routes/webroutes');
const apirouter = require('./routes/apiroutes');
const flash = require('express-flash-messages')



//app.use(flash());

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/dashboard/user', express.static(path.join(__dirname, "public")));
app.use('/dashboard/admin', express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname + 'uploads')));
// Static Files
// dashboard 
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/css', express.static(__dirname + 'public/assets2/css'));
app.use('/font', express.static(__dirname + 'public/assets2/fonts'));
app.use('/css', express.static(__dirname + 'public/assets3/css'));
app.use('/font', express.static(__dirname + 'public/assets3/fonts'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/js', express.static(__dirname + 'public/assets2/js'));
app.use('/js', express.static(__dirname + 'public/assets3/js'));
app.use('/images', express.static(__dirname + 'public/images'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/img', express.static(__dirname + 'public/assets2/img'));
app.use('/img', express.static(__dirname + 'public/assets3/img'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(cookieParser(process.env.CSECRET));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SECRET,
  cookie: {
      httpOnly: true,
      maxAge: 6000
  }
}))
app.use(flash({
  passToView: true
}))
app.use(passport.initialize());
app.use(passport.session());
require('./middleware/passport')(passport);
app.use('/', webrouter);
app.use('/api', apirouter);






module.exports = app;