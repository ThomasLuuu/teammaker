const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Banlist = require('../models/Banlist');
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongo = require('mongodb');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bodyParser = require('body-parser');
const { db } = require('../models/Banlist');
const Adminlist = require('../models/Admin');

// Welcome Page
router.use(bodyParser.json())
router.get('/', forwardAuthenticated, (req, res)=>{
  res.render('welcome', {
    user: req.user
  })
});
// Dashboard
router.get('/dashboard', ensureAuthenticated,(req, res)=>{
      Post.find({course: {$exists: true}}, function(err, data){
        res.render('dashboard.ejs',{
          user  :req.user,
          users  : data
        });
      });
});

//Dashboard for admin

router.get('/dashboardadmin', ensureAuthenticated,(req, res)=>{
  Post.find({course: {$exists: true}}, function(err, data){
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
  Post.findById(req.params.id, function(err, post){
    res.render('projectdetail', {
      post:post

    });
  });
});
// Add Projects
router.get('/addproject/:id', ensureAuthenticated,(req, res) =>
  res.render('addproject', {
    post: req.post,
    user: req.user,
    
  })
);

//load form of editing post
router.get('/edits/:id',ensureAuthenticated ,(req,res) =>{
  Post.findById(req.params.id, function(err, post){
    res.render('editproject', {
      post: post

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
  let post = {};
  post.course = req.body.course;
  post.classtime = req.body.classtime;
  post.GPA = req.body.GPA;
  post.creator = req.body.creator;
  post.requirement = req.body.requirement;
  post.photo = req.body.photo;

  let query = {_id:req.params.id}

  Post.update(query, post, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      res.redirect('/');
    }
  });



});

//Upgrade to admin
router.get('/adminpermission/:id', function(req, res){
  let user = {};
  user.role = 'admin';
  let query ={_id:req.params.id}

  User.update(query, user, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      res.redirect('/');
    }
  })
})

//delete post
router.get('/deletepost/:id', ensureAuthenticated, (req,res) =>{
  Post.findByIdAndDelete(req.params.id, function(err, post){
    res.redirect('/dashboard')
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
//delete users
router.get('/delete/:id', ensureAuthenticated, (req,res) =>{
  User.find({_id: req.params.id}).select('-_id email').exec(function(err, result){
    var deletemail = result.map(({email})=>email)
    console.log(deletemail[0])
    Post.remove({creator: deletemail[0]},function(err){
      if(err){
        console.log("fix this bug!");
      }
    });
    User.findByIdAndDelete(req.params.id, function(err,user){
      res.redirect('/dashboard')
    });
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

//Upgrade to admin function
// router.get('/adminpermission/:id',ensureAuthenticated, (req, res)=>{
//   User.findById(req.params.id, function(err,user){
//     var userids = "ObjectId("+'"'+req.params.id+'"'+")";
//     console.log(userids)
//    User.find({_id: req.params.id}).select('-_id email').exec(function(err, result){
//     //  console.log(result);
//      var adminemailget = result.map(({email})=>email)
//     //  var banemailconfirmed = banemailget.values();
//     //  console.log("confirm this " + banemailconfirmed)
     
//      const newAdminlist = new Adminlist({
//         adminemail: adminemailget[0],
//      })
//      newAdminlist.save()
//      .then(user => {
//       req.flash(
//         'success_msg',
//         'upgrade sucessfully'
//         );
//       res.redirect('/dashboard');
//     })
//    })
    
//   }
//   )

// });

//fiding project TEST

router.get('/search/keyword', function(req, res){
  
  Post.find({name: req.query.keyword}, function(err, data){
    res.render('dashboard.ejs',{
      post :req.user, //user
      posts :data     //users
    });
  });
});


// Adding

router.post('/addproject/:id', (req, res) => {
  User.findById(req.params.id, function(err, user){
    var userids = "ObjectId"+'"'+req.params.id+'"'+")";
    User.find({_id: req.params.id}).select('-_id email').exec(function(err, result){
      var postor = result.map(({email})=>email)
      const { course, classtime, GPA, creator, requirement, photo } = req.body;
      let errors = [];
      if ( !course || !classtime || !GPA || !requirement || !photo) {
        errors.push({ msg: 'Please enter all fields' });
      }
      if (errors.length > 0) {
        res.render('addproject', {
          errors,
          course,
          classtime,
          GPA,
          creator,
          requirement,
          photo
        });
      } else {
            const newPost = new Post({
              course,
              classtime,
              GPA,
              creator : postor[0],
              requirement,
              photo
            });
    
          
            newPost
            .save()
            .then(user => {
              req.flash(
                'success_msg',
                'You added new project'
              );
              res.redirect('/dashboard');
            })
          
            
        
      }
    }) 
  })
});

module.exports = router;
