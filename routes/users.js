const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const Banlist = require('../models/Banlist');
const Post = require('../models/Post');
const { forwardAuthenticated } = require('../config/auth');
const {authRole} = require('../config/authrole');
const { checktype } = require('../config/auth');

// Login Page
router.get('/login',forwardAuthenticated, (req, res)=>res.render('login'));

//Login Admin
router.get('/loginadmin', forwardAuthenticated, (req,res) =>res.render('loginadmin')); 

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));
router.get('/demoregister',(req,res) => {
  res.render('register')})
// Register
router.post('/register', (req, res) => {
  const { password, password2 } = req.body;
  const email = req.body.email;
  const name = req.body.name;
  const role = req.body.role;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (req.body.email.indexOf("@rmit")>=1){
      console.log("this is rmit email")    
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
      } Banlist.findOne({ banemail : email }).then(user => {
        if(user){
          errors.push({ msg: 'You have been ban' });
          console.log("you have been banned");
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
        }else {
          const newUser = new User({
            name,
            email,
            password,
            role: 'user'
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
      }) 
    });
  }
});


//Login admin checking
router.post('/loginadmin', (req, res, next) => {
  const email = req.body.email
  User.find({email: email }).select('-_id role').exec(function(err, result){
    if(err) return next(err);
    var idrole = result.map(({role})=>role)
    console.log(result)
    console.log(email)
    if(idrole[0]='admin'){
      User.findOne({email:email}).then(user =>{
        if(user){
          passport.authenticate('local',{
            successRedirect: '/dashboardadmin',
            failureRedirect: '/users/loginadmin',
            failureFlash: true
          })
          (req, res, next)
        }
      })
          
      }else{
      console.log('Back to user page')
    }
    
  })

});
// Login
router.post('/login', (req, res, next) => {
  const email = req.body.email
  User.findOne({email : email}).then(user =>{
    if(user){
      passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
      })
      (req, res, next)
    }
  }) 
});
// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
  