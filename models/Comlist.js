const mongoose = require('mongoose');

var app = require('express')()
const ComlistSchema = new mongoose.Schema({
    account:{
        type: String,
    },
    comment:{
        type: String,
    },
    post:{
        type: String,
    },
});

const Comlist = mongoose.model('Comlist', ComlistSchema);

module.exports = Comlist;