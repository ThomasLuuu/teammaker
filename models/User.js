const mongoose = require('mongoose');
// This is the place I created the Schema for the MongoDB

var app = require('express')()
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  studentid:{
    type:String,
},
studentyear:{
      type:String,
},
course: {
  type: String,
},
courseid: {
  type: String,
},
semester: {
  type: String,
},
assignment: {
  type: String,
},
description: {
  type: String,
},
percentage: {
  type: String,
},
technologyuse: {
  type: String,
},
scope: {
  type: String,
},
company: {
  type: String,
},
application: {
  type: String,
},
photo: {
  type: String,
},
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
//delete project
app.delete('/users/:id', function(req,res){
  User.deleteOne({id: req.params.id}, function(err, result){
    res.send(result)
  })
})
module.exports = User;
