const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

/**
 * Sign in using Username and Password.
 */
passport.use(new LocalStrategy({usernameField: 'username'}, (username, password, done) => {
    User.findOne({username: username.toLowerCase(),isActive:true}, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {msg: `Username ${username} not found.`});
        }
        if (!user.activated) {
            return done(null, false, {msg: `Username ${username} not activated.`});
        }
        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, user);
            }
            return done(null, false, {msg: 'Invalid username or password.'});
        });
    });
}));

/**
 * Authentication Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('unauthenticated');
};
