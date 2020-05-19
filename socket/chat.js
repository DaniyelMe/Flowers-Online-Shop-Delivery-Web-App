var debug = require('debug')('ex6:chat-socket');
var Chat = require('../models/Chat');
var User = require('../models/User');
var Group = require('../models/Group');
var Conversation = require('../models/Conversation');
var Message = require('../models/Message');
var express = require('express');
var cookieParser = require('cookie-parser');
// const mongoose = require('mongoose');
// const ObjectId = require('mongoose').Types.ObjectId;
const roomMessage = require('../utilities/roomMessages');


module.exports = function (app, io) {
    let connectedUsers = {};
    const chat = io.of("/chat");


    // "Globals"
    // var defaultRoom = 'general';
    // var rooms = ["general", "angular", "socket.io", "express", "node", "mongo"];

    chat.on('error', function (error) {
        debug('Chat error ' + error);
    });

    // sharedSession = require('express-socket.io-session')(app.objSession, app.cookieParser);

    chat.use(function (socket, next) {
        //console.log(socket);
        var req = socket.handshake;
        var res = {
            end: function () {
            }
        };
        app.cookieParser(req, res, function (err) {
            app.objSession(req, res, function () {
                // debug("Chat middleware: " + JSON.stringify(socket.id) + " ID=" + req.sessionID + " user=" + req.session.user);
                debug("Chat middleware: " + JSON.stringify(socket.id) + " ID=" + req.sessionID + " user=");
                next();
            });
        });
    });

    chat.on('connection', function (socket) {
            //socket.set('transports', ['websocket']);
            var req = socket.handshake;
            // var currentRoom = undefined;
            debug("socket connection: " + socket.id + " - " + JSON.stringify(req.session));
            if (!req.session || !req.session.passport || !req.session.passport.user) {
                debug("Unauthorized connection!");
                socket.disconnect(true);
                return;
            }
            var userID = req.session.passport.user;
            if (!connectedUsers[userID]) {
                connectedUsers[userID] = {};
            }
            if (!connectedUsers[userID].sockets) {
                connectedUsers[userID].sockets = [];
            }
            connectedUsers[userID].sockets.push(socket);
            // connectedUsers[userID].sockets.push(socket.client.id);
            // connectedUsers[req.session.passport.user].emit('something', 'something');

            socket.on('disconnect', function () {
                connectedUsers[userID] = undefined;

                debug("socket disconnect: " + socket.id);
            });

            function isLogin() {
                // if (req.session) debug("Checking user: " + req.session.user);
                if (req.session && req.session.passport && req.session.passport.user) {
                    debug("authorized connection!");
                    return true;
                }
                return currentRoom !== undefined;
            }

            socket.on('logout', function (data) {
                debug("socket logout: " + req.session.user);
                if (isLogin()) {
                    socket.leaveAll();
                    socket.emit('setup', {rooms: []});
                    // debug('emit in ' + currentRoom + ", left: " + JSON.stringify(data));
                }
            });

            //Listens for new user and jointed him to rooms name of
            // all his groups and all his messages participants
            socket.on('login', function (data) {
                debug("socket login: " + req.session.passport.user + " - " + JSON.stringify(data));
                roomMessage.getMessages(socket, userID)
            });

            socket.on('addConversation', function (data, fn) {
                roomMessage.addConversation(data, socket, fn);
            });

            socket.on('newConversation', function (data, fn) {
                roomMessage.newConversation(data, socket, chat, fn);
            });

            socket.on('newGroup', function (data, fn) {
                roomMessage.newGroup(data, socket, chat, fn);
            });

            //Listens for joint Conversation
            socket.on('join conversation', function (data) {
                if (isLogin()) {
                    socket.join(data);
                    var i = 0;
                    debug('join in ' + data + ", joined: " + JSON.stringify(data));
                }
            });

        //Listens for joint Conversation
        socket.on('add group', function (data) {
            if (isLogin()) {
                socket.join(data);
                debug('join in ' + data + ", joined: " + JSON.stringify(data));
            }
        });

            //Listens for joint group
            socket.on('join group', function (data, fn) {
                if (isLogin()) {
                    roomMessage.joinGroup(data, socket, chat, io, connectedUsers, fn);
                }
            });

        //Listens for joint group
        socket.on('like', function (data,fn) {
            if (isLogin()) {
                roomMessage.like(data, socket, chat, fn);
            }
        });

        //Listens for joint group
        socket.on('attach group', function (data) {
            if (isLogin()) {
                roomMessage.attachGroup(data, socket, chat);
            }
        });

        //Listens for 
        socket.on('attach user', function (data) {
            if (isLogin()) {
                roomMessage.attachUser(data, socket, chat);
            }
        });

        //Listens for joint group
        socket.on('remove member', function (data, fn) {
            if (isLogin()) {
                roomMessage.removeMember(data, socket, chat, connectedUsers, fn);
            }
        });


        //Listens for joint Conversation
        socket.on('remove group', function (data) {
            if (isLogin()) {
                socket.leave(data);
                debug('leave from ' + data + ", leaved: " + JSON.stringify(data));
            }
        });

            //Listens for switch room
            socket.on('switch', function (data) {
                if (isLogin()) {
                    debug("socket switch: from " + currentRoom + " to " + data.newRoom);
                    if (currentRoom != data.newRoom) {
                        socket.leave(currentRoom);
                        socket.join(data.newRoom);
                        debug('emit in ' + currentRoom + ", left: " + JSON.stringify(data));
                        chat.in(currentRoom).emit('left', data);
                        currentRoom = data.newRoom;
                        debug('emit in ' + currentRoom + ", joined: " + JSON.stringify(data));
                        chat.in(currentRoom).emit('joined', data);
                    }
                }
            });

            //Listens for a new chat message
            socket.on('message', function (data) {
                if (isLogin()) {
                    //Create message and Save it to database
                    debug("socket message: saving");
                    // data.room.name = mongoose.Types.ObjectId(data.room.name);
                    Message.create(data)
                        .then(msg => {
                            Message.findOne(msg).populate('author', 'username profileImage').then(msg => {
                                // if (msgs instanceof Array) {
                                debug('emit in ' + data.room.name + ", message: " + JSON.stringify(msg));
                                chat.in(data.room.name).emit('message', msg)
                                // }
                            }, err => {
                                debug('Error getting from Message DB: ' + JSON.stringify(err));
                            });
                        }).catch(err => {
                        debug("Failed saving chat message: ", err);
                    });
                }
            });

            //Listens for a new chat message
            socket.on('generalMessage', function (data) {
                if (isLogin()) {
                    //Create message and Save it to database
                    debug("socket message: saving");
                    data.room.name = undefined;
                    Message.create(data)
                        .then(msg => {
                            Message.findOne(msg).populate('author', 'username profileImage').then(msg => {
                                // if (msgs instanceof Array) {
                                debug('emit in ' + data.room.name + ", message: " + JSON.stringify(msg));
                                // chat.in(data.room.name).emit('message', msg)
                                chat.emit('general message', msg)
                                // }
                            }, err => {
                                debug('Error getting from Message DB: ' + JSON.stringify(err));
                            });
                        }).catch(err => {
                        debug("Failed saving chat message: ", err);
                    });
                }
            });

            socket.on('privateMessage', function (to, message) {
                var id = connectedUsers[to];
                io.sockets.socket(id).emit('sendPrivateMessage', socket.username, message);
            });
        }
    )
    ;
}
;