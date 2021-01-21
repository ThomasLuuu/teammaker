const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const vendors = require('vendors');
const app = express();
const socket = require('socket.io');
const bodyParser = require('body-parser');
// Passport Config
require('./config/passport')(passport);

//Run connect IO

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
app.use(express.static('public'));
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
app.use(bodyParser.urlencoded({extended:false}));
// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


//Render index page
app.get('/chat', (req, res) => {
  res.render('index')
})

//Get username and roomname from form and pass it to room
app.post('/room', (req, res) => {
  roomname = req.body.roomname;
  username = req.body.username;
  res.redirect(`/room?username=${username}&roomname=${roomname}`)
})

//Rooms
app.get('/room', (req, res)=>{
  res.render('room')
})


app.use('/users', require('./routes/users.js'));
app.use('/', require('./routes/index.js'));
const port = process.env.PORT ||  5000;

//Start Server
const server = app.listen(port, () => {
  console.log(`Server Running on ${port}`)
})

const io = socket(server);
require('./utils/socket')(io);