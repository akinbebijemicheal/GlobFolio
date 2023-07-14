const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
//const flash = require('connect-flash')
const path = require('path');
require('dotenv').config()
const passport = require('passport');
const cookieParser = require('cookie-parser');
const apirouter = require('./routes/apiroutes');
const flash = require('express-flash-messages');
const store = require('store');
const multerpic = require('multer');
const Notification = require("./helpers/notification");



const db = require("./config/config");



//app.use(flash());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser(process.env.CSECRET));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.TOKEN,
  cookie: {
    httpOnly: false,
    maxAge: 60000
  }
}))
app.use(flash({
  passToView: true
}))
app.get("/", (req, res) => {
  res.send(`IWTYS APP ${new Date()}`);
});
app.use(passport.initialize());
app.use(passport.session());
require('./middleware/passport')(passport);
app.use('/api', apirouter);

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  allowEIO3: true, // false by default
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
  transports: ["websocket", "polling"],
});

app.io = io;



io.on("connection", async (socket) => {
  console.log("New Connection", socket.id);
  io.emit("getNotifications", await Notification.fetchAdminNotification());
  io.emit(
    "getUserNotifications",
    await Notification.fetchUserNotificationApi(socket.handshake.query)
  );
  io.emit(
    "getGeneralNotifications",
    await Notification.fetchGeneralNotification(socket.handshake.query)
  );
  socket.on("notification_read", async (data) => {
    const { id } = data;
    socket.emit("markAsRead", await Notification.updateNotification(id));
  });

  socket.on("disconnect", () => {
    
  });
});

app.get("/", (req, res) => {
  res.send(`BOG APP ${new Date()}`);
});

db.authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Error: " + err));

db.sync();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening to port ${port}, at http://localhost:${port}}`);
});