const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongo = require('mongodb');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bodyParser = require('body-parser');

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
  user.studentid = req.body.studentid;
  user.studentyear = req.body.studentyear;
  user.course = req.body.course;
  user.courseid = req.body.courseid;
  user.semester = req.body.semester;
  user.assignment = req.body.assignment;
  user.description = req.body.description;
  user.percentage = req.body.percentage;
  user.technologyuse = req.body.technologyuse;
  user.scope = req.body.scope;
  user.company = req.body.company;
  user.application = req.body.application;
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
    res.redirect('/userdisplay')
  });
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
  const { name, studentid, studentyear, course, courseid, semester, assignment, description, percentage, technologyuse, scope, company, application, photo } = req.body;
  let errors = [];

  if ( !studentid || !studentyear || !course || !courseid || !semester || !assignment || !description || !percentage || !technologyuse || !scope || !company || !application || !photo) {
    errors.push({ msg: 'Please enter all fields' });
  }
  
  

  if (errors.length > 0) {
    res.render('addproject', {
      errors,
      name,
      studentid,
      studentyear,
      course,
      courseid,
      semester,
      assignment,
      description,
      percentage,
      technologyuse,
      scope,
      company,
      application,
      photo
    });
  } else {
    User.findOne({ assignment: assignment }).then(user => {
      if (user) {
        errors.push({ msg: 'Assignment already exists' });
        res.render('addproject', {
          errors,
          name,
          studentid,
          studentyear,
          course,
          courseid,
          semester,
          assignment,
          description,
          percentage,
          technologyuse,
          scope,
          company,
          application,
          photo
        });
      } else{
        const newUser = new User({
          name,
          studentid,
          studentyear,
          course,
          courseid,
          semester,
          assignment,
          description,
          percentage,
          technologyuse,
          scope,
          company,
          application,
          photo
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.scope, salt, (err, hash) => {
            if (err) throw err;
            newUser.scope = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You added new project'
                );
                res.redirect('/dashboard');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

module.exports = router;
