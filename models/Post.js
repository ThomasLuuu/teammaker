const mongoose = require('mongoose');
// This is the place I created the Schema for the MongoDB

var app = require('express')()
const PostSchema = new mongoose.Schema({
  creator:{
    type:String,
},
course: {
  type: String,
},
classtime: {
  type: String,
},
GPA: {
  type: String,
},
requirment: {
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

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
