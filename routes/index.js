const express = require('express');
const router = express.Router();
const {authRole} = require('../config/authrole');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const {authorcheck} = require('../config/authorcheck');
const {personalcheck} = require('../config/personal');
const Banlist = require('../models/Banlist');
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const Favlist = require('../models/Favlist');
const Comlist = require('../models/Comlist');
const passport = require('passport');
const mongo = require('mongodb');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bodyParser = require('body-parser');
const { db } = require('../models/Banlist');
const { render } = require('ejs');
const { query } = require('express');
// Welcome Page
router.use(bodyParser.json())
router.get('/', forwardAuthenticated, (req, res)=>{
  res.render('welcome', {
    user: req.user
  })
});
// Dashboard
router.get('/dashboard', ensureAuthenticated,(req, res)=>{
      Post.find({course: {$exists: true}}, {},
        {sort: {_id: -1}},
        function(err, data){
        res.render('dashboard.ejs',{
          post  :req.post,
          posts  : data,
          user: req.user,
          users: data,
        });
      });
});

//Dashboard for admin
router.get('/dashboardadmin',authRole("admin"), ensureAuthenticated,(req, res)=>{
  Post.find({course: {$exists: true}}, {},
    {sort: {_id: -1}},
    function(err, data){
    res.render('dashboardadmin.ejs',{
      post  :req.post,
      posts  : data,
      user: req.user,
      users: data,
    });
  });
});
//user edit their profile
router.get('/personedit/:id',personalcheck(),(req,res)=>{
  User.findById(req.params.id, function(err, user) {
    res.render('personedit',{
      user:user
    })
    
  })
})
//control user
router.get('/userdisplay',authRole("admin"), ensureAuthenticated,(req, res)=>{
  User.find({course: {$exists: false}}, function(err, data){
    res.render('userdisplay',{
      user  :req.user,
      users  : data
    });
  });
});

//detail page of products
router.get('/detail/:id',ensureAuthenticated ,(req,res) =>{
  Comlist.find({comment: {$exists: true}, post : req.params.id}, {},
    {sort: {_id: -1}},
    function(err, data) {
    Post.findById(req.params.id, {},
      {sort: {_id: -1}},
      function(err, post) {
      res.render('projectdetail',{
        post: post,
        user: req.user,
        comlist: req.comlist,
        comlists: data,
      })
      
    })
    
  })
});
// Load add project form
router.get('/addproject/:id', ensureAuthenticated,(req, res) =>
  res.render('addproject', {
    post: req.post,
    user: req.user,
    
  })
);
//load form of editing post
router.get('/edits/:id',authorcheck(),ensureAuthenticated ,(req,res) =>{
  Post.findById(req.params.id, function(err, post){
    res.render('editproject', {
      post:post,
      user:req.user,

    });
  });
});
//load form of user editing
router.get('/edituser/:id', authRole("admin"),ensureAuthenticated ,(req,res) =>{
  User.findById(req.params.id, function(err, user){
    res.render('edituser', {
      user:user

    });
  });
});
//edit project
router.post('/edits/:id',function(req, res){
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
router.get('/adminpermission/:id',authRole("admin"), function(req, res){
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
router.get('/deletepost/:id',authorcheck(), ensureAuthenticated, (req,res) =>{
  Post.findByIdAndDelete(req.params.id, function(err, post){
    res.redirect('/dashboard')
  });
});

//edit user

router.post('/personedit/:id', (req, res) => {
  const { password, password2 } = req.body;
  const email = req.body.email;
  const name = req.body.name;
  const role = req.body.role;
  const avata = req.body.avata;
  const field = req.body.field;
  const major = req.body.major;
  const minor = req.body.minor;
  let errors = [];

  

  if (req.body.email.indexOf("@rmit")>=1){
      console.log("this is rmit email")    
  }else{
    errors.push({msg: 'USE RMIT EMAIL ONLY'})
  }

  
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      avata,
      field,
      major,
      minor,
    });
  } else {
       Banlist.findOne({ banemail : email }).then(user => {
        if(user){
          errors.push({ msg: 'You have been ban' });
          console.log("you have been banned");
        return;
        }else {
          let user = {};
          user.name = req.body.name;
          user.email = req.body.email;
          user.avata = req.body.avata;
          user.field = req.body.field;
          user.major = req.body.major;
          user.minor = req.body.minor;
          let query = {_id:req.params.id}
          let comlist ={};
          let query1 = {account: req.user.email}
          comlist.avata = req.body.avata;
          User.update(query, user, function(err){

            if(err){
              console.log(err);
              return;
            }else{
              Comlist.updateMany(query1, comlist, function(err){
                if(err){
                  console.log(err);
                  return;
                }else{
                  res.redirect('/dashboard')
                }
              })
            }
          });
        }
      }) 
    
  }
});

//delete users
router.get('/delete/:id', authRole("admin"), ensureAuthenticated, (req,res) =>{
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
   User.find({_id: req.params.id}).select('-_id email').exec(function(err, result){
     var banemailget = result.map(({email})=>email)
     let deletepost = {creator : banemailget[0]} 
     let deletecomt = {account : banemailget[0]}
     Post.deleteMany(deletepost, function(err, del){
     })
     Comlist.deleteMany(deletecomt, function(err, del){

     })
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
//add to fav list function
router.get('/addfavlist/:id/:idpost', ensureAuthenticated, (req, res)=>{
  User.findById(req.params.id, function(err, user){
    Post.findById(req.params.idpost, function(err, post){
      Post.find({_id: req.params.idpost}).select('_id  creator classtime course').exec(function(err, postadd){
        User.find({_id: req.params.id}).select('_id').exec(function(err, result){
          var liker = result.map(({_id})=> (_id))
          var namepost = postadd.map(({creator})=>creator)
          var datepost = postadd.map(({classtime})=>classtime)
          var coursepost= postadd.map(({course})=>course)
          var poster = postadd.map(({_id})=>_id)
          const newFavlist = new Favlist({
            account: liker[0],
            course: coursepost[0],
            date: datepost[0],
            name: namepost[0],
            favpost: poster[0],
          })
          newFavlist.save()
          .then(fav =>{
            req.flash(
              'success_msg',
              'you liked it'
            );
            res.redirect('/dashboard');
      
          })
        })
      })
      })
  }
  )
});
//display fav
router.get('/fav/:id', ensureAuthenticated, personalcheck(), (req,res)=>{
  Favlist.find({account:req.params.id},function (err, data) {
    Post.find({_id: req.params.id},function(err, post) {
      res.render('favoritelist.ejs',{
        favlist: req.favlist,
        favlists: data,
        user: req.user,
        post: post,
        
      })
      
    })
    
  })
})
//Comment function
router.post('/cmt/:id/:idpost', (req, res) => {
  User.findById(req.params.id, function(err, user){
    User.find({_id: req.params.id}).select('-_id email').exec(function(err, result){
      User.find({_id: req.params.id}).select('-_id name avata').exec(function(err, resultname) {
        Post.findById(req.params.idpost, function(err, post) {
          Post.find({_id: req.params.idpost}).select('_id').exec(function(err, postlocation){
            var commentor = result.map(({email})=>email)
            var nameadd = resultname.map(({name})=>name)
            var postid = postlocation.map(({_id})=>_id)
            var ava = resultname.map(({avata})=>avata)
            const {comment, post, account, studentname, avata } = req.body;
            let errors = [];
            if ( !comment) {
              errors.push({ msg: 'Please enter all fields' });
            }
            if (errors.length > 0) {
              res.render('projectdetail', {
                comment,
                post,
                account,
                studentname,
              });
            } else {
                  const newComlist = new Comlist({
                    comment,
                    avata: ava[0],
                    post: postid[0],
                    studentname: nameadd[0],
                    account : commentor[0],
                  });
          
                
                  newComlist
                  .save()
                  .then(com => {
                    req.flash(
                      'success_msg',
                      'Comment'
                    );
                    res.redirect("/detail/" +postid[0] );
                  })
                
                  
              
            }
          })
          
        })
        
      })
    }) 
  })
});

//fiding project TEST

router.get('/search/keyword', function(req, res){
  
  Post.find({creator: req.query.keyword}, function(err, data){
    res.render('dashboard.ejs',{
      post  :req.post,
      posts  : data,
      user: req.user,
      users: data,
    });
  });
});


// Function add project

router.post('/addproject/:id', (req, res) => {
  User.findById(req.params.id, function(err, user){
    User.find({_id: req.params.id}).select('_id email').exec(function(err, result){
      var postor = result.map(({email})=>email)
      var idget = result.map(({_id})=>_id)
      const { course, classtime, GPA, creator, creatorid, requirement, photo } = req.body;
      let errors = [];
      if ( !course || !classtime || !GPA || !requirement ) {
        errors.push({ msg: 'Please enter all fields' });
      }
      if (errors.length > 0) {
        res.render('addproject', {
          errors,
          course,
          classtime,
          GPA,
          creator,
          creatorid,
          requirement,
          photo
        });
      } else {
            const newPost = new Post({
              course,
              classtime,
              GPA,
              creator : postor[0],
              creatorid:idget[0],
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

router.get('/chatme', ensureAuthenticated,(req, res) =>
  res.render('chat.ejs')
);

router.get('/profile/:id',ensureAuthenticated,(req, res)=>{
  User.find({_id: req.params.id}).select('-_id email').exec(function(err, data) {
    var profile = data.map(({email})=>email);

    User.find({_id: req.params.id}, function(err, us) {
      Post.find({creator: profile[0]}, function (err, display){
        res.render('userprofile.ejs', {
          user: req.user,
          users: us,
          post: req.post,
          posts: display,
        })
        
      })
      
    })

  })
  
})
router.get('/guestprofile/:id',ensureAuthenticated,(req, res)=>{
  User.find({_id: req.params.id}).select('-_id email').exec(function(err, data) {
    var profile = data.map(({email})=>email);

    User.find({_id: req.params.id}, function(err, us) {
      Post.find({creator: profile[0]}, function (err, display){
        res.render('guestprofile.ejs', {
          user: req.user,
          users: us,
          post: req.post,
          posts: display,
        })
        
      })
      
    })

  })
  
})



module.exports = router;
