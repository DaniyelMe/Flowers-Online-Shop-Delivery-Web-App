const mongoose = require('mongoose');
var debug = require('debug')('ex6:chat');

var chatSchema = mongoose.Schema({
    content: String,
    username: String,
    room: String
}, {timestamps: true});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;