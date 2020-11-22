const mongoose = require('mongoose');
// This is the place I created the Schema for the MongoDB
var app = require('express')()
const AdminSchema = new mongoose.Schema({
  adminemail: {
    type: String,
  },
});

const Adminlist = mongoose.model('Adminlist', AdminSchema);

module.exports = Adminlist;
 