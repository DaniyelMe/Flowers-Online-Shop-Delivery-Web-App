var debug = require('debug')('ex6:socket');
module.exports = function(app, io) {
    //io.set('transports', ['websocket']);
    var chat = require('./chat')(app, io);
    debug('INFO: socket.js initialized');
}
