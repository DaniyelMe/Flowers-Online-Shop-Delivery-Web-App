var debug = require('debug')('ex6:utilities-findMessages');
var User = require('../models/User');
var Group = require('../models/Group');
var Conversation = require('../models/Conversation');
var Message = require('../models/Message');
var express = require('express');
var cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
// const ObjectId = mongoose.Types.ObjectId;


/**
 *
 * ...
 */
// exports.getMessages = (rooms,socket,userID) => {
exports.getMessages = (socket, userID) => {

    let rooms = {};

    function findMessages(items, next) {
        if (items instanceof Array) {
            let i = 0;
            let l = items.length;
            items.forEach(item => {
                socket.join(item._id);
                // Message.find({'room.name': ObjectId(items._id)}).populate('author', 'username').exec()
                Message.find({'room.name': items._id}).populate('author', 'username').exec()
                    .then(msgs => {
                        debug('Got from Message DB: ' + JSON.stringify(conversations));
                        if (msgs instanceof Array) {
                            item._doc.messages = msgs;
                        }
                        if (++i === l) {
                            rooms.items = items;
                            next();
                        }
                    }, err => {
                        debug('Error getting from Message DB: ' + JSON.stringify(err));
                    });
            });
            if (l == 0) {
                conversationMessages();
            }
        } else {
            debug('Error getting from item DB: items is not instanceof Array');
        }
    }

    function groupMessages() {
        //join to room of all his groups _id
        //return all his groups rooms with room's id,name,messages
        Group.find({'members': userID}, {'_id': 1, 'name': 1}).exec()
            .then(groups => {
                    debug('Got from Group DB: ' + JSON.stringify(groups));
                    if (groups instanceof Array) {
                        let i = 0;
                        let l = groups.length;
                        groups.forEach(group => {
                            socket.join(group._id);
                            // Message.find({'room.name': ObjectId(groups._id)}).populate('author', 'username').exec()
                            Message.find({'room.name': groups._id}).populate('author', 'username').exec()
                                .then(msgs => {
                                    debug('Got from Message DB: ' + JSON.stringify(conversations));
                                    if (msgs instanceof Array) {
                                        group._doc.messages = msgs;
                                    }
                                    if (++i === l) {
                                        rooms.groups = groups;
                                        conversationMessages();
                                    }
                                }, err => {
                                    debug('Error getting from Message DB: ' + JSON.stringify(err));
                                });
                        });
                        if (l == 0) {
                            conversationMessages();
                        }
                    } else {
                        debug('Error getting from Group DB: groups is not instanceof Array');
                    }
                },
                err => {
                    debug('Error getting from Group DB: ' + JSON.stringify(err));
                });
    }

    function conversationMessages() {
        //join to room of all his conversations _id
        //return all his conversations rooms with room's id,name,messages
        Conversation.find({$or: [{'forAllUsers': true}, {'participants': userID}]}
            , {'_id': 1, 'name': 1}).exec()
            .then(conversations => {
                    debug('Got from Conversation DB: ' + JSON.stringify(conversations));
                    if (conversations instanceof Array) {
                        let i = 0;
                        let l = conversations.length;
                        conversations.forEach(conversation => {
                            socket.join(conversation._id);
                            // Message.find({'room.name': ObjectId(conversation._id)}).populate('author', 'username').exec()
                            Message.find({'room.name': conversation._id}).populate('author', 'username').exec()
                                .then(msgs => {
                                    debug('Got from Message DB: ' + JSON.stringify(conversations));
                                    if (msgs instanceof Array) {
                                        conversation._doc.messages = msgs;
                                    }
                                    if (++i === l) {
                                        rooms.conversations = conversations;
                                        userMessages();
                                    }
                                }, err => {
                                    debug('Error getting from Message DB: ' + JSON.stringify(err));
                                });
                        });
                        if (l == 0) {
                            userMessages();
                        }
                    }
                },
                err => {
                    debug('Error getting from Conversation DB: ' + JSON.stringify(err));
                });
    }

    function userMessages() {
        //join to room of all his conversations _id
        //return all his conversations rooms with room's id,name,messages
        User.findById(userID, {'_id': 1, 'username': 1}).exec()
            .then(user => {
                    debug('Got from User DB: ' + JSON.stringify(user));
                    if (user) {
                        socket.join(user._id);
                        // Message.find({'room.name': ObjectId(user._id)}).populate('author', 'username').exec()
                        Message.find({'room.name': user._id}).populate('author', 'username').exec()
                            .then(msgs => {
                                if (msgs instanceof Array) {
                                    user.messages = msgs;
                                    rooms.user = user;
                                    socket.emit('setup', {rooms});
                                }
                            }, err => {
                                debug('Error getting from Message DB: ' + JSON.stringify(err));
                            });
                    }
                },
                err => {
                    debug('Error getting from User DB: ' + JSON.stringify(err));
                });
    }

    groupMessages()
};


/**
 * emit(addConversation)
 * add conversation.
 */
exports.addConversation = (data, socket, fn) => {

    User.findOne({username: data.recipient}, (err, existingUser) => {
        if (err) {
            socket.emit('addConversation', {success: false, message: err, data: data})
        }
        if (!existingUser) {
            socket.emit('addConversation', {
                success: false,
                message: 'Account with this username dosen\'t exists.',
                data: data
            })
        }
        const conversation = new Conversation({
            forAllUsers: data.forAllUsers,
            participants: [socket.handshake.session.passport.user, existingUser._id],
        });

        User.find({_id: {$in: conversation.participants}}, {username: 1}, function (err, users) {
            if (err) {
                socket.emit('addConversation', {
                    success: false,
                    message: "get participants username failure: " + err,
                    data: data
                })
            }
            else if (users instanceof Array) {
                conversation.name = data.name ||
                    users.map(e => e.username).sort().join('-');
                conversation.save((err, conversation1) => {
                    if (err) {
                        socket.emit('addConversation', {success: false, message: err, data: data})
                    }
                    else {
                        fn(conversation1);
                        // socket.emit('addConversation', {success: true, message: 'success', data: conversation1})
                    }
                });
            }
            else {
                socket.emit('addConversation', {success: false, message: 'users not instanceof Array', data: data})
            }
        });
    });
};


/**
 * emit(newConversation)
 * new conversation.
 */
exports.newConversation = (data, socket, fn) => {

    User.findOne({username: data.recipient}, (err, existingUser) => {
        if (err) {
            socket.emit('addConversation', {success: false, message: err, data: data})
        }
        if (!existingUser) {
            socket.emit('addConversation', {
                success: false,
                message: 'Account with this username dosen\'t exists.',
                data: data
            })
        }
        const conversation = new Conversation({
            forAllUsers: data.forAllUsers,
            participants: [socket.handshake.session.passport.user, existingUser._id],
        });

        User.find({_id: {$in: conversation.participants}}, {username: 1}, function (err, users) {
            if (err) {
                socket.emit('addConversation', {
                    success: false,
                    message: "get participants username failure: " + err,
                    data: data
                })
            }
            else if (users instanceof Array) {
                conversation.name = data.name ||
                    users.map(e => e.username).sort().join('-');
                conversation.save((err, conversation1) => {
                    if (err) {
                        socket.emit('addConversation', {success: false, message: err, data: data})
                    }
                    else {
                        fn(conversation1);
                        // socket.emit('addConversation', {success: true, message: 'success', data: conversation1})
                    }
                });
            }
            else {
                socket.emit('addConversation', {success: false, message: 'users not instanceof Array', data: data})
            }
        });
    });
};

