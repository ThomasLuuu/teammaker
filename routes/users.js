const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
const { checktype } = require('../config/auth');

// Login Page
router.get('/login',forwardAuthenticated, (req, res)=>res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));
router.get('/demoregister',(req,res) => {
  res.render('register')})
// Register
router.post('/register', (req, res) => {
  const { password, password2 } = req.body;
  const email = req.body.email;
  const name = req.body.name;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (req.body.email.indexOf("@rmit")>=1){
    console.log("a123")
    
  }else{
    errors.push({msg: 'rmit staff and student only!'})
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }


  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  const email = req.body.email
  var check = email;
  if(check != "new@rmit"){
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true})
  (req, res, next);
}

  if(check = "new@rmit"){
    passport.authenticate('local', {
      successRedirect: '/dashboardadmin',
      failureRedirect: '/users/login',
      failureFlash: true})
      (req, res, next);
}

// router.post('/login', (req, res, next) => {
//   const email = req.body.email
//   console.log(email);
//   if(req.body.email = "new@rmit"){
//     console.log(req.body.email);
  // passport.authenticate('local', {
  //   successRedirect: '/dashboard',
  //   failureRedirect: '/users/login',
  //   failureFlash: true
//   })(req, res, next);
// }
});
// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
  