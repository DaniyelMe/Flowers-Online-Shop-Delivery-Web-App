const debug = require("debug")("ex6:mongodb");
/**
 * Connect to MongoDB.
 */
const mongoose = require('mongoose');
require('mongoose-type-url');
require('mongoose-type-email');
mongoose.Promise = Promise;
const mongodb = mongoose.connection;
mongodb.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});
mongodb.on('connecting', function () {
    debug('Connecting to MongoDB: ');
});
mongodb.on('connected', function () {
    debug('Connected to MongoDB: ');
});
mongodb.on('disconnecting', function () {
    debug('Disconnecting to Mongomongodb: ');
});
mongodb.on('disconnected', function () {
    debug('Disconnected to Mongomongodb: ');
});
mongodb.on('reconnected', function () {
    debug('Reconnected to MongoDB: ');
});
mongodb.on('error', function (err) {
    debug('Error to MongoDB: ' + err);
});
mongodb.on('open', function () {
    debug('MongoDB open : ');
});
mongodb.on('close', function () {
    debug('MongoDB close: ');
});
process.on('SIGINT', function () {
    mongodb.close(function () {
        process.exit(0);
    });
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/ex6');
// mongoose.connect('mongodb://localhost/CompanyProject');


module.exports = mongodb;
