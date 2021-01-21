const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const socketio = require('socket.io');
const session = require('express-session');
const vendors = require('vendors');
const app = express();
const http = require('http').Server(app);

const bodyParser = require('body-parser');
const io = require('socket.io')(http);
// Passport Config
require('./config/passport')(passport);

//Run connect IO
io.sockets.on('connection', function(socket) {
  socket.on('username', function(username) {
      socket.username = username;
      io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
  });

  socket.on('disconnect', function(username) {
      io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
  })

  socket.on('chat_message', function(message) {
      io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
  });

});
// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS

app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/node_modules_bootstrap/dist/css' ));
app.use(express.static(__dirname+ './config'));

//Access to CSS and Image
app.use("/image",express.static(__dirname + "/image"));
app.use("/css", express.static(__dirname + "/css"));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
//Body Parser

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.get('/chatme', function(req, res) {
  res.render('chat.ejs');
  
})
app.use('/users', require('./routes/users.js'));
app.use('/', require('./routes/index.js'));
const PORT = process.env.PORT ||  5000;
// app.listen(PORT, console.log(`Server started on port ${PORT}`));
// app.listen(process.env.PORT, function() {
  
// })

const server = http.listen(PORT, function() {
  console.log('listen on 5000')
})