const debug = require('debug')('ex6:session');
const mongodb = require('./mongodb');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(session);

module.exports = session({
    name: 'myapp.sid',
    secret: "my special secret",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    store: new MongoStore({ mongooseConnection: mongodb }),
    // cookie: { maxAge: 900000, httpOnly: true, sameSite: true }
    cookie: { maxAge: 9000000, httpOnly: true, sameSite: true }
});
