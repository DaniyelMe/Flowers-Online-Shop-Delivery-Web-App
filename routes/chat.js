const debug = require('debug')('ex6:chat-route');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Group = require('../models/Group');
const Conversation = require('../models/Conversation');

/**
 * GET /.../...
 * ...
 */
exports.getChat = (req, res) => {
    res.render('partials/chat');
};

/**
 * GET /chat/messages
 * all messages.
 */
exports.getMessages = (req, res) => {
    // debug('INFO1: msgs' + JSON.stringify(req.query));
    // const session = req.session;
    // if (!session || !session.passport || !session.passport.user) {
    //     res.json("not logged on");
    //     return;
    // }
    // debug('INFO: msgs authorized');

    //Find
    // Chat.find({'room': req.query.room}).exec()
    Chat.find({'room': {$in:[]}}).sort('-createdAt').limit(7).exec()
        .then(msgs => {
            debug('Got from chat DB: ' + JSON.stringify(msgs));
            if (msgs instanceof Array)
                res.json(msgs);
            else
                res.json([]);
        }, err => {
            debug('Error getting from chat DB: ' + JSON.stringify(err));
            res.json([])
        });
};

/**
 * POST /chat/addConversation
 * add conversation.
 */
exports.postAddConversation = (req, res) => {

    User.findOne({username: req.body.recipient}, (err, existingUser) => {
        if (err) {
            return next(err);
        }
        if (!existingUser) {

            req.flash('errors', {msg: 'Account with this username dosen\'t exists.'});
            return res.status(401).json(req.flash('errors'));
        }
        const conversation = new Conversation({
            // name: req.body.name || req.user.username+'-'+existingUser.username,
            forAllUsers: req.body.forAllUsers,
            participants: [req.user._id, existingUser._id],
        });
        // conversation.name = req.body.name ||
        //     conversation.participants.sort().join('-');

        User.find({_id: {$in: conversation.participants}}, {username: 1}, function (err, users) {
            if (err)
                res.status(401).json("get flowers failure: " + err);
            else if (users instanceof Array) {
                conversation.name = req.body.name ||
                    users.map(e => e.username).sort().join('-');
                conversation.save((err,conversation1) => {
                    if (err) {
                        return next(err);
                    }
                    else {
                        // req.flash('success', {msg: 'Success! AddConversation.'});
                        // res.json(req.flash('success'));
                        res.json(conversation1);
                    }
                });
            }
            else
                res.json(users);
        });


    });

};


/**
 * GET /group/groups
 * groups list.
 */
exports.getGroups = (req, res) => {
    Group.find({}, {name: 1}, function (err, groups) {
        if (err) {
            res.status(401).json("get groups failure: " + err);
        }
        else {
            res.json(groups);
        }
    });
};

/**
 * GET /group/groupsMange
 * groups to manage list.
 */
exports.getGroupsManage = (req, res) => {
    Group.find({admin: req.user._id}).populate('members', 'username')
        .then(groups => {
            let i = 0;
            let l = groups.length;
            groups.forEach(group => {
                group.members.splice(0, 1);
                if (++i === l) {
                    res.json(groups);
                }
            });
        }, err => {
            res.status(401).json("get groups failure: " + err);
        });
};

/**
 * GET /group/groupsToJoin
 * groups to join list.
 */
exports.getGroupsToJoin = (req, res) => {
    Group.find({members: {$ne: req.user._id}}, {name: 1}, function (err, groups) {
        if (err)
            res.status(401).json("get groups failure: " + err);
        else
            res.json(groups);
    });
};
