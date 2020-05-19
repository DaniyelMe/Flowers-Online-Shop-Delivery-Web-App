/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const flash = require('express-flash');
const path = require('path');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const passport = require('passport');
var debug = require('debug')('ex6:app');


/**
 * Routers handlers.
 */
var index = require('./routes/index');

/**
 * Passport configuration.
 */
const session = require('./config/session');

/**
 * Express configuration.
 */
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(logger('dev'));
app.objSession = session;
app.use(function(req,res,next) {
    session(req,res,function(){
        debug("Session middleware: " + !!req.session + " ID=" + req.sessionID);
        next();
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.cookieParser = cookieParser();
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/**
 * Primary app routes.
 */

app.use('/', index);
app.use('/api', index);


/**
 * Error Handler.
 */
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error',{message:''});
});

module.exports = app;