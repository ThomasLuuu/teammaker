const mongoose = require('mongoose');
// This is the place I created the Schema for the MongoDB
var app = require('express')()
const FavlistSchema = new mongoose.Schema({
  favpost: {
    type: String,
  },
  account:{
      type: String,
  }
});

const Favlist = mongoose.model('Favlist', FavlistSchema);

module.exports = Favlist;
 