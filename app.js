const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
//const { session, store } = require('./model/session');
const session = require('express-session');
const flash = require('express-flash-notification')
require('dotenv').config();
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
//const cookieEncrypter = require('cookie-encrypter')
const webrouter = require('./routes/webroutes');
const apirouter = require('./routes/apiroutes');
const cookieSession = require('cookie-session');



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
app.use(cookieParser(process.env.CSECRET));
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SECRET,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60
    }
}))
app.use(passport.initialize());
app.use(passport.session());

/*app.use(cookieSession({
    name: process.env.S_NAME,
    keys: [process.env.CSECRET, process.env.CSECRET]
}))*/
app.use(flash(app, {
    viewName:  './partials/alerts.ejs',
    beforeSingleRender: function(notification, callback) {
    if (notification.type) {
      switch(notification.type) {
        case 'error':
          notification.alert_class = 'alert-danger'
          notification.icon_class = 'fa-times-circle'
        break;
        case 'alert':
          notification.alert_class = 'alert-warning'
          notification.icon_class = 'fa-times-circle'
        break;
        case 'info':
          notification.alert_class = 'alert-info'
          notification.icon_class = 'fa-times-circle'
        break;
        case 'success':
          notification.alert_class = 'alert-success'
          notification.icon_class = 'fa-check'
        break;
        case 'ok':
          notification.alert_class = 'alert-primary'
          notification.icon_class = 'fa-check'
        break;
      }
    }
    callback(null, notification)
  },
  afterAllRender: function(htmlFragments, callback) {
    // Naive JS is appened, waits a while expecting for the DOM to finish loading,
    // The timeout can be removed if jOuery is loaded before this is called, or if you're using vanilla js.
    htmlFragments.push([
      '<script type="text/javascript">',
      ' var timer = setInterval(function(){',
      '      if (window.jOuery){',
      '            clearInterval(timer)',
      '            $(".alert.flash").slideDown().find(".close").on("click", function(){$(this).parent().slideUp()})',
      '      }',
      ' }, 200)',
      '</script>',
    ].join(''))
    callback(null, htmlFragments.join(''))
  },

}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

require('./middleware/passport')(passport);
app.use('/', webrouter);
app.use('/api', apirouter);






module.exports = app;