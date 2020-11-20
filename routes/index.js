const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Banlist = require('../models/Banlist');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongo = require('mongodb');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bodyParser = require('body-parser');
const { db } = require('../models/Banlist');

// Welcome Page
router.use(bodyParser.json())
router.get('/', forwardAuthenticated, (req, res)=>{
  res.render('welcome', {
    user: req.user
  })
});
// Dashboard
router.get('/dashboard', ensureAuthenticated,(req, res)=>{
      User.find({course: {$exists: true}}, function(err, data){
        res.render('dashboard.ejs',{
          user  :req.user,
          users  : data
        });
      });
});

//Dashboard for admin

router.get('/dashboardadmin', ensureAuthenticated,(req, res)=>{
  User.find({course: {$exists: true}}, function(err, data){
    res.render('dashboardadmin.ejs',{
      user  :req.user,
      users  : data
    });
  });
});
//control user
router.get('/userdisplay', ensureAuthenticated,(req, res)=>{
  User.find({course: {$exists: false}}, function(err, data){
    res.render('userdisplay',{
      user  :req.user,
      users  : data
    });
  });
});
//detail page of products
router.get('/detail/:id',ensureAuthenticated ,(req,res) =>{
  User.findById(req.params.id, function(err, user){
    res.render('projectdetail', {
      user:user

    });
  });
});
// Add Projects
router.get('/addproject', ensureAuthenticated,(req, res) =>
  res.render('addproject', {
    user: req.user,
   
  })
);

//load form of editing
router.get('/edits/:id',ensureAuthenticated ,(req,res) =>{
  User.findById(req.params.id, function(err, user){
    res.render('editproject', {
      user:user

    });
  });
});
//load form of user editing
router.get('/edituser/:id',ensureAuthenticated ,(req,res) =>{
  User.findById(req.params.id, function(err, user){
    res.render('edituser', {
      user:user

    });
  });
});
//edit project
router.post('/edits/:id', function(req, res){
  let user = {};
  user.name = req.body.name;
  user.course = req.body.course;
  user.classtime = req.body.classtime;
  user.GPA = req.body.GPA;
  user.creator = req.body.creator;
  user.requirement = req.body.requirement;
  user.photo = req.body.photo;

  let query = {_id:req.params.id}

  User.update(query, user, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      res.redirect('/');
    }
  });



});
//edit user
router.post('/edituser/:id', function(req, res){
  let user = {};
  user.name = req.body.name;
  user.email = req.body.email;

  let query = {_id:req.params.id}

  User.update(query, user, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      res.redirect('/userdisplay');
    }
  });



});
//delete project
router.get('/delete/:id', ensureAuthenticated, (req,res) =>{
  User.findByIdAndDelete(req.params.id, function(err, user){
    res.redirect('/dashboard')
  });
});

//create ban user function
router.get('/banuser/:id',ensureAuthenticated, (req, res)=>{
  User.findById(req.params.id, function(err,user){
    var userids = "ObjectId("+'"'+req.params.id+'"'+")";
    console.log(userids)
   User.find({_id: req.params.id}).select('-_id email').exec(function(err, result){
    //  console.log(result);
     var banemailget = result.map(({email})=>email)
    //  var banemailconfirmed = banemailget.values();
    //  console.log("confirm this " + banemailconfirmed)
     
     const newBanlist = new Banlist({
        banemail: banemailget[0],
     })
     newBanlist.save()
     .then(user => {
      req.flash(
        'success_msg',
        'ban sucessfully'
        );
      res.redirect('/dashboard');
    })
   })
    
  }
  )

});
//fiding project TEST

router.get('/search/keyword', function(req, res){
  
  User.find({name: req.query.keyword}, function(err, data){
    res.render('dashboard.ejs',{
      user :req.user,
      users :data
    });
  });
});
// Adding

router.post('/addproject', (req, res) => {
  const { name, course, classtime, GPA, creator, requirement, photo } = req.body;
  let errors = [];

  if (!name || !course || !classtime || !GPA || !creator|| !requirement || !photo) {
    errors.push({ msg: 'Please enter all fields' });
  }
  
  

  if (errors.length > 0) {
    res.render('addproject', {
      errors,
      name,
      course,
      classtime,
      GPA,
      creator,
      requirement,
      photo
    });
  } else {
        const newUser = new User({
          name,
          course,
          classtime,
          GPA,
          creator,
          requirement,
          photo
        });

      
        newUser
        .save()
        .then(user => {
          req.flash(
            'success_msg',
            'You added new project'
          );
          res.redirect('/dashboard');
        })
      
        
    
  }
});

module.exports = router;
