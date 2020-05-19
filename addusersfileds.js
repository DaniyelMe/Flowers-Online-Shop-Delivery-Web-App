require('./config/mongodb');
var User = require('./models/Message');
var debug = require('debug')('ex6:listUsers');


User.find({type:'system'}, function (err, users) {
    debug('find before:');
    if (err) {
        debug(err)
    }
    else {
        debug('users: ' + JSON.stringify(users));
        User.update({type:'system'}, {$set: {type: 'joining'}}, {upsert: false, multi: true}, function (err, res) {
            if (err) {
                debug(err)
            }
            else {
                debug('updated:');
                User.find({type:'joining'}, function (err, users) {
                    debug('find after:');
                    if (err) {
                        debug(err)
                    }
                    else {
                        debug('users: ' + JSON.stringify(users));
                        process.exit(0);
                    }
                });
            }
        });
    }
});


