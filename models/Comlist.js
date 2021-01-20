const mongoose = require('mongoose');

var app = require('express')()
const ComlistSchema = new mongoose.Schema({
    account:{
        type: String,
    },
    comment:{
        type: String,
    },
    studentname:{
        type: String,
    },
    post:{
        type: String,
    },
    avata:{
        type: String,
    },
});

const Comlist = mongoose.model('Comlist', ComlistSchema);

module.exports = Comlist;