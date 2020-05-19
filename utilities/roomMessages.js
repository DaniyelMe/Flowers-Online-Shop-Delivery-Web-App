var debug = require('debug')('ex6:utilities-roomMessages');
var User = require('../models/User');
var Group = require('../models/Group');
var Conversation = require('../models/Conversation');
var Message = require('../models/Message');
var email = require('../utilities/email');
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
                // Message.find({'room.name': ObjectId(items._id)}).populate('author', 'username profileImage').exec()
                Message.find({'room.name': items._id}).populate('author', 'username profileImage').exec()
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
        Group.find({isActive: true, members: userID}).populate('admin', 'username').exec()
        // Group.find({'members': userID}, {'_id': 1, 'name': 1}).exec()
        // Group.find({$or:[{'members': userID},{'admin': userID}]}, {'_id': 1, 'name': 1}).exec()
            .then(groups => {
                    debug('Got from Group DB: ' + JSON.stringify(groups));
                    if (groups instanceof Array) {
                        let i = 0;
                        let l = groups.length;
                        groups.forEach(group => {
                            socket.join(group._id);
                            var notType = (group.admin._id != userID ? 'admin' : '');
                            Message.find({
                                $or: [{type: {$ne: 'joining'}}, {author: {$ne: userID}}],//exclude his join group message
                                type: {$ne: notType},//exclude group's joins requests messages
                                'room.kind': 'group',
                                'room.name': group._id
                            }).populate('author', 'username profileImage').exec()
                                .then(msgs => {
                                    debug('Got from Message DB: ' + JSON.stringify(msgs));
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
                            rooms.groups = [];
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
        // Conversation.find({$or: [{'forAllUsers': true}, {'participants': userID}]}
        Conversation.find({isActive: true, $or: [{'participants': userID}]}
            , {'_id': 1, 'name': 1}).exec()
            .then(conversations => {
                    debug('Got from Conversation DB: ' + JSON.stringify(conversations));
                    if (conversations instanceof Array) {
                        let i = 0;
                        let l = conversations.length;
                        conversations.forEach(conversation => {
                            socket.join(conversation._id);
                            // Message.find({'room.name': ObjectId(conversation._id)}).populate('author', 'username').exec()
                            Message.find({
                                'room.kind': 'conversation',
                                'room.name': conversation._id
                            }).populate('author', 'username profileImage').exec()
                                .then(msgs => {
                                    debug('Got from Message DB: ' + JSON.stringify(msgs));
                                    if (msgs instanceof Array) {
                                        conversation._doc.messages = msgs;
                                    }
                                    if (++i === l) {
                                        rooms.conversations = conversations;
                                        generalMessages();
                                    }
                                }, err => {
                                    debug('Error getting from Message DB: ' + JSON.stringify(err));
                                });
                        });
                        if (l == 0) {
                            rooms.conversations = [];
                            generalMessages();
                        }
                    }
                },
                err => {
                    debug('Error getting from Conversation DB: ' + JSON.stringify(err));
                });
    }

    function generalMessages() {
        //return all general messages room's name,messages
        Message.find({isActive: true, 'room.kind': 'general'}).populate('author', 'username profileImage').exec()
            .then(msgs => {
                    debug('Got from Message DB: ' + JSON.stringify(msgs));
                    if (msgs instanceof Array) {
                        rooms.general = {name: 'general', messages: msgs};
                        userMessages();
                    }
                },
                err => {
                    debug('Error getting from Conversation DB: ' + JSON.stringify(err));
                }
            )
        ;
    }

    function userMessages() {
        //join to room of all his conversations _id
        //return all his conversations rooms with room's id,name,messages
        User.findById(userID, {username: 1, role: 1}).exec()
            .then(user => {
                    debug('Got from User DB: ' + JSON.stringify(user));
                    if (user) {
                        socket.join(user._id);
                        Message.find({isActive: true, 'room.kind': 'user', 'room.name': user._id})
                            .populate('author', 'username profileImage').exec().then(msgs => {
                            if (msgs instanceof Array) {
                                user._doc.messages = msgs;
                                rooms.user = user;
                                if (user.role === 'Admin') {
                                    socket.join('system');
                                    systemMessages();
                                } else {
                                    socket.emit('setup', {rooms});
                                }
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

    function systemMessages() {
        //return all system messages room's name,messages
        Message.find({isActive: true, 'room.kind': 'system'}).populate('author', 'username profileImage').exec()
            .then(msgs => {
                    debug('Got from Message DB: ' + JSON.stringify(msgs));
                    if (msgs instanceof Array) {
                        rooms.system = {name: 'system', messages: msgs};
                        socket.emit('setup', {rooms});
                    }
                },
                err => {
                    debug('Error getting from Conversation DB: ' + JSON.stringify(err));
                }
            )
        ;
    }


    groupMessages()
}
;


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
exports.newConversation = (data, socket, chat, fn) => {

    //get recipient _id
    User.findOne({$or: [{username: data.conversation.recipient}, {email: data.conversation.recipient}]}, (err, existingUser) => {
        if (err) {
            // socket.emit('addConversation', {success: false, message: err, data: data})
            fn({success: false, message: err, data: data})
            return;
        }
        if (!existingUser) {
            fn({
                success: false,
                message: 'Account with this username dosen\'t exists.',
                data: data
            });
            // socket.emit('addConversation', {
            //     success: false,
            //     message: 'Account with this username dosen\'t exists.',
            //     data: data
            // });
            return;
        }
        const conversation = new Conversation({
            forAllUsers: data.conversation.forAllUsers,
            participants: [socket.handshake.session.passport.user, existingUser._id],
        });

        //set conversation name to participants usernames
        User.find({_id: {$in: conversation.participants}}, {username: 1}, function (err, users) {
            if (err) {
                // socket.emit('addConversation', {
                //     success: false,
                //     message: "get participants username failure: " + err,
                //     data: data
                // })
                fn({
                    success: false,
                    message: "get participants username failure: " + err,
                    data: data
                });
                return;
            }
            else if (users instanceof Array) {
                conversation.name = data.conversation.name ||
                    users.map(e => e.username).sort().join('-');
                Conversation.findOne({name: conversation.name}, function (err, result) {
                    if (err) {

                    }
                    if (!result) {
                        conversation.save((err, conversation1) => {
                            if (err) {
                                // socket.emit('addConversation', {success: false, message: err, data: data})
                                fn({success: false, message: err, data: data})
                            }
                            else {
                                // fn(conversation1);
                                data.msg.room.name = conversation1._id;
                                Message.create(data.msg)
                                    .then(msg => {
                                        Message.findOne(msg).populate('author', 'username profileImage').then(msg => {
                                            // if (msgs instanceof Array) {
                                            // debug('emit in ' + data.msg.room.name + ", message: " + JSON.stringify(msg));
                                            // chat.broadcast.in(msg.room.name).emit('message', msg);
                                            // socket.join(conversation1._id);
                                            conversation1._doc.messages = [msg];
                                            conversation.participants.forEach(participant => {
                                                //     if(participant !== )
                                                // io.sockets.socket(id).emit('sendPrivateMessage', socket.username, message);
                                                chat.to(participant).emit('addConversation', conversation1)
                                            });
                                            // chat.to(existingUser._id).emit('addConversation', conversation1)
                                            fn({success: true, message: 'success', data: conversation1})
                                            // }
                                        }, err => {
                                            debug('Error getting from Message DB: ' + JSON.stringify(err));
                                        });
                                    }).catch(err => {
                                    debug("Failed saving chat message: ", err);
                                });
                                // fn({success: true, message: 'success', data: conversation1})
                                // socket.emit('addConversation', {success: true, message: 'success', data: conversation1})
                            }
                        });
                    }
                    else {
                        data.msg.room.name = result._id;
                        Message.create(data.msg)
                            .then(msg => {
                                Message.findOne(msg).populate('author', 'username profileImage').then(msg => {
                                    // if (msgs instanceof Array) {
                                    // debug('emit in ' + data.msg.room.name + ", message: " + JSON.stringify(msg));
                                    // chat.broadcast.in(msg.room.name).emit('message', msg);
                                    // socket.join(conversation1._id);
                                    result._doc.messages = [msg];
                                    chat.to(result._id).emit('message', msg);
                                    conversation.participants.forEach(participant => {
                                        //     if(participant !== )
                                        // io.sockets.socket(id).emit('sendPrivateMessage', socket.username, message);
                                        // chat.to(participant).emit('addConversation',result)
                                    });
                                    // chat.to(existingUser._id).emit('addConversation', conversation1)
                                    fn({success: true, message: 'success', data: result})
                                    // }
                                }, err => {
                                    debug('Error getting from Message DB: ' + JSON.stringify(err));
                                });
                            }).catch(err => {
                            debug("Failed saving chat message: ", err);
                        });
                    }
                });
            }
            else {
                fn({success: false, message: 'users not instanceof Array', data: data})
                // socket.emit('addConversation', {success: false, message: 'users not instanceof Array', data: data})
            }
        });
    });
};

/**
 * emit(newGroup)
 * new group.
 */
exports.newGroup = (data, socket, chat, fn) => {

    debug("socket message: saving");
    // data.room.name = mongoose.Types.ObjectId(data.room.name);
    // data.members = [data.admin];
    Group.create(data)
        .then(group => {
            Group.findOne(group).then(group => {
                socket.join(group._id);
                fn({success: true, group: group});
            }, err => {
                debug('Error getting from Group DB: ' + JSON.stringify(err));
                fn({success: false, err: err});
            });
        }).catch(err => {
        debug("Failed create new Group: ", err);
        fn({success: false, err: err});
    });
};

/**
 * emit(join group)
 * join group.
 */
exports.joinGroup = (data, socket, chat, io, connectedUsers, fn) => {

    debug("join group");
    // Group.findById(data.id, function (err, group) {
    Group.findOne({name: data}, function (err, group) {
        if (err) {
            fn(err);
        }
        if (!group) {
            fn("group not found!");
        }
        else {
            var userID = socket.handshake.session.passport.user;
            User.findById(userID, {username: 1}, function (err, user) {
                if (err) {
                    fn(err);
                }
                if (!user) {
                    fn("user not found!");
                }
                else {
                    if (group.members.indexOf(user._id) >= 0) {
                        fn("You are already a member of the group!");
                        return;
                    }
                    Message.create({
                        author: user._id,
                        room: {kind: 'group', name: group._id},
                        type: 'admin',
                        content: 'Add me to the group'
                    })
                        .then(msg => {
                            Message.findOne(msg).populate('author', 'username profileImage').then(msg => {
                                // if (msgs instanceof Array) {
                                debug('emit in ' + msg.room.name + ", message: " + JSON.stringify(msg));
                                chat.in(group.admin).emit('message', msg);
                                fn();
                                // }
                            }, err => {
                                debug('Error getting from Message DB: ' + JSON.stringify(err));
                            });
                        }).catch(err => {
                        debug("Failed saving chat message: ", err);
                    });
                }
            });


        }
    });
};


/**
 * emit(attach group)
 * attach group.
 */
exports.attachGroup = (data, socket, chat) => {

    function updateMsg(msg, notice) {
        msg.content += ' - ' + notice;
        msg.save(
            // msg.update({content: msg.content + ' - ' + notice},
            function (err) {
                if (err) {
                    debug('msg update err:' + err);
                }
                else {
                    Message.findOne(msg).populate('author', 'username profileImage').then(msg => {
                        socket.emit('message update', msg);
                    }, err => {
                        debug('Error getting from Message DB: ' + JSON.stringify(err));
                    });
                }
            })
    }

    debug("attach group");
    Message.findOne({_id: data.message, isActive: true}, function (err, msg) {
            if (err) {
                debug('Error getting from Message DB: ' + JSON.stringify(err));
            }
            if (!msg) {
                debug('message not found');
            } else {
                if (!data.attach) {
                    updateMsg(msg, 'not attached');
                    return;
                }
                Group.findOne({_id: data.group, isActive: true}, function (err, group) {
                    if (err) {
                        debug('Error getting from Group DB: ' + JSON.stringify(err));
                    }
                    if (!group) {
                        debug("group not found!");
                        return;
                    }
                    User.findOne({_id: msg.author, isActive: true}, {username: 1}, function (err, user) {
                        if (err) {
                            debug('Error getting from User DB: ' + JSON.stringify(err));
                        }
                        if (!user) {
                            updateMsg(msg, "user not found!");
                            return;
                        }
                        if (group.members.indexOf(user._id) >= 0) {
                            updateMsg(msg, "already attached");
                            return;
                        }
                        group.update({$push: {members: user._id}}, function (err, ok) {
                            if (err) {
                                debug('err:' + err);
                            } else {
                                debug('ok:' + ok);
                                updateMsg(msg, "attached");
                                Message.create({
                                    author: user._id,
                                    room: {kind: 'group', name: group._id},
                                    type: 'joining',
                                    content: user.username + ' joined the group'
                                })
                                    .then(message => {
                                        // Message.findOne(msg).then(msg => {
                                        // if (msgs instanceof Array) {
                                        debug('emit in ' + message.room.name + ", message: " + JSON.stringify(msg));
                                        chat.in(message.room.name).emit('message', message)
                                        Message.find({
                                            $or: [{type: {$ne: 'joining'}}, {author: {$ne: user._id}}],//exclude his join message
                                            type: {$ne: 'admin'},//exclude group's joins requests messages
                                            'room.kind': 'group',
                                            'room.name': group._id
                                        }).populate('author', 'username profileImage').exec()
                                            .then(msgs => {
                                                debug('Got from Message DB: ' + JSON.stringify(msgs));
                                                if (msgs instanceof Array) {
                                                    group._doc.messages = msgs;
                                                    chat.to(user._id).emit('add group', group);
                                                }
                                            }, err => {
                                                debug('Error getting from Message DB: ' + JSON.stringify(err));
                                            });
                                        //     // }
                                        // }, err => {
                                        //     debug('Error getting from Message DB: ' + JSON.stringify(err));
                                        // });
                                    }).catch(err => {
                                    debug("Failed create message: ", err);
                                });
                            }
                        });
                    });
                });
            }
        }
    );
};

/**
 * emit(attach group)
 * attach group.
 */
exports.attachUser = (data, socket, chat) => {

    function updateMsg(msg, notice) {
        msg.content += ' - ' + notice;
        msg.save(
            // msg.update({content: msg.content + ' - ' + notice},
            function (err) {
                if (err) {
                    debug('msg update err:' + err);
                }
                else {
                    Message.findOne(msg).populate('author', 'username profileImage').then(msg => {
                        socket.emit('system message update', msg);
                    }, err => {
                        debug('Error getting from Message DB: ' + JSON.stringify(err));
                    });
                }
            })
    }

    debug("attach user");
    Message.findOne({_id: data.message._id, isActive: true}, function (err, msg) {
            if (err) {
                debug('Error getting from Message DB: ' + JSON.stringify(err));
            }
            if (!msg) {
                debug('message not found');
            } else {
                if (!data.attach) {
                    updateMsg(msg, 'not activated');
                    return;
                }
                User.findOne({_id: msg.author, isActive: true}, function (err, user) {
                    if (err) {
                        debug('Error getting from User DB: ' + JSON.stringify(err));
                    }
                    if (!user) {
                        updateMsg(msg, "user not found!");
                        return;
                    }
                    if (user.activated) {
                        updateMsg(msg, "already activated");
                        return;
                    }
                    user.update({$set: {activated: true}}, function (err, ok) {
                        if (err) {
                            debug('err:' + err);
                        } else {
                            debug('ok:' + ok);
                            updateMsg(msg, "activated");
                            email.sendActivatedEmail(user);
                        }
                    });
                });
            }
        }
    );
};

/**
 * emit(remove member)
 * remove member.
 */
exports.removeMember = (data, socket, chat, connectedUsers, fn) => {

    debug("remove member");
    var userID = socket.handshake.session.passport.user;
    Group.findOne({_id: data.group, admin: userID, isActive: true}, function (err, group) {
            if (err) {
                debug('Error getting from Message DB: ' + JSON.stringify(err));
                fn('Error getting from Message DB: ' + JSON.stringify(err));
                return;
            }
            if (!group) {
                debug('group not found');
                fn('group not found');
                return;
            }
            var index = group.members.findIndex(m => m == data.user._id);
            group.members.splice(index, 1);
            group.save(function (err) {
                if (err) {
                    debug('group member update err:' + err);
                    fn('group member update err:' + err);
                    return;
                }
                Message.create({
                    author: data.user._id,
                    room: {kind: 'group', name: group._id},
                    type: 'joining',
                    content: data.user.username + ' left the group'
                }).then(message => {
                        debug('emit in ' + message.room.name + ", message: " + JSON.stringify(msg));
                        chat.in(message.room.name).emit('message', message)
                    }, err => {
                        debug('Error getting from Message DB: ' + JSON.stringify(err));
                    }
                );
                chat.to(data.user._id).emit('remove group', data.group);
                fn();
                // try {
                //     connectedUsers[data.user].forEach(socket => {
                //         socket.leave(data.group);
                //     })
                // } catch (err) {
                // }
            });
        }
    )
    ;
}
;


/**
 * emit(like)
 * like.
 */
exports.like = (data, socket, chat, fn) => {

    debug("like");
    Message.findOne({_id: data.message._id, isActive: true}, function (err, msg) {
            if (err) {
                debug('Error getting from Message DB: ' + JSON.stringify(err));
                fn('Error getting from Message DB: ' + JSON.stringify(err));
            }
            if (!msg) {
                debug('message not found');
                fn('message not found');
            } else {
                var userID = socket.handshake.session.passport.user;
                if ((msg.likes && msg.likes.indexOf(userID) >= 0) ||
                    (msg.unlikes && msg.unlikes.indexOf(userID) >= 0)) {
                    fn('You can not check twice');
                    return;
                } else {
                    if (data.like) {
                        msg.likes.push(userID);
                    } else {
                        msg.unlikes.push(userID);
                    }
                    msg.save(function (err) {
                        if (err) {
                            debug('msg update err:' + err);
                            fn('msg update err:' + err);
                        }
                        else {
                            Message.findOne(msg).populate('author', 'username profileImage').then(msg => {
                                // socket.emit('message update', msg);
                                if (msg.room.kind == 'general') {

                                    chat.emit('general message update', msg);
                                }
                                if (msg.room.kind == 'group') {

                                    chat.to(msg.room.name).emit('message update', msg);
                                }
                                fn();
                            }, err => {
                                debug('Error getting from Message DB: ' + JSON.stringify(err));
                                fn('Error getting from Message DB: ' + JSON.stringify(err));
                            });
                        }
                    })
                }
            }
        }
    );
};
