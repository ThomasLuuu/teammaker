const mongoose = require('mongoose');
// This is the place I created the Schema for the MongoDB
var app = require('express')()
const BanlistSchema = new mongoose.Schema({
  banemail: {
    type: String,
  },
});

const Banlist = mongoose.model('Banlist', BanlistSchema);

module.exports = Banlist;
 