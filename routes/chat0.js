const express = require('express');
const debug = require('debug')('ex6:chat-route');
const router = express.Router();
const Chat = require('../models/Chat');


module.exports = router;

router.get('/', function (req, res) {
    res.redirect('/chat/messages');
    // debug('INFO: msgs' + JSON.stringify(req.query));
    // const session = req.session;
    // if (!session || !session.passport || !session.passport.user) {
    //     res.json("not logged on");
    //     return;
    // }
    // debug('INFO: msgs authorized');
    //
    // //Find
    // // Chat.find({'room': req.query.room}).exec()
    // Chat.find({'room': 'if'}).exec()
    //     .then(msgs => {
    //         debug('Got from chat DB: ' + JSON.stringify(msgs));
    //         if (msgs instanceof Array)
    //             res.json(msgs)
    //         else
    //             res.json([]);
    //     }, err => {
    //         debug('Error getting from chat DB: ' + JSON.stringify(err));
    //         res.json([])
    //     });
});
