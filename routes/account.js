const debug = require('debug')('ex6:routes-account');
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const path = require('path');
const Message = require('../models/Message');
const User = require('../models/User');
const fs = require('fs');


//set the email password from outer source
const pass = fs.readFileSync('C://Users/LENOVO/Desktop/pass.txt', 'utf8');


/**
 * GET /session/user
 * get session's user account.
 */
exports.getUser = (req, res) => {
    let user = req.user;
    if (user) {
        user.password = undefined;
    }
    res.json(user);
};

/**
 * GET /login
 * Login Model.
 */
exports.getLogin = (req, res) => {
    if (req.user) {
        return res.status(403).send('Forbidden');
    }
    res.render('account/login');
};


/**
 * POST /login
 * Login using username and password.
 */
exports.postLogin = (req, res, next) => {
    req.assert('password', 'Password cannot be blank').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json(info);
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            if (req.body.remember) {
                const week = 7 * 24 * 60 * 60 * 1000;
                req.session.cookie.expires = new Date(Date.now() + week);
                req.session.cookie.maxAge = week;
            }
            res.send('Success! You are logged in.');
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.sendStatus(200);
};

/**
 * GET /register
 * Register Model.
 */
exports.getRegister = (req, res) => {
    if (req.user) {
        return res.status(403).send('Forbidden');
    }
    res.render('account/register');
};

/**
 * POST /register
 * Create a new account.
 */
exports.postRegister = (req, res, next) => {
    const io = req.app.get('socket-io');

    req.assert('email', 'Email is not valid').isEmail();
    // req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    const user = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        profileImage: 'account/profileImage/' + req.body.username + '.jpg'
    });
    User.findOne({username: req.body.username}, (err, existingUser) => {
            if (err) {
                return next(err);
            }
            if (existingUser) {
                return res.status(400).json('Account with this username already exists.');
            }
            User.findOne({email: req.body.email}, (err, existingEmail) => {
                if (err) {
                    return next(err);
                }
                if (existingEmail) {
                    return res.status(400).json(req.flash('Account with that email address already exists.'));
                }
                if (!req.body.isFileImage) {
                    //TODO check if url is valid
                    user.profileImage = req.body.profileImage;
                } else {
                    const dest = '../uploads/account/profileImage/';
                    fs.rename(dest + req.sessionID + '.jpg',
                        dest + req.body.username + '.jpg',
                        function (err) {
                            if (err) {
                                debug('error rename profile image: ' + JSON.stringify(err));
                                return res.status(400).json(err);
                            }
                        });
                }
                user.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    Message.create({
                        author: user._id,
                        room: {kind: 'system'},
                        type: 'joining',
                        content: 'Activated my account'
                    }).then(msg => {
                        Message.findOne(msg).populate('author').then(msg => {
                            debug('emit in ' + msg.room.kind + ", message: " + JSON.stringify(msg));
                            io.of("/chat").to('system').emit('user registered', msg);
                            res.json('You\'ve successfully signed up, and you\'ll receive an email when your account will be activated.');
                        }, err => {
                            debug('Error getting from Message DB: ' + JSON.stringify(err));
                        });
                    }).catch(err => {
                        debug("Failed saving chat message: ", err);
                    });
                });
            });
        }
    );
};

/**
 * GET /account
 * account profile Model.
 */
exports.getAccount = (req, res) => {
    res.render('account/profile');
};


/**
 * GET /account/profileImage
 * Get profile image.
 */
exports.getProfileImage = (req, res, next) => {
    let filePath = '../uploads/account/profileImage/' + req.params.username;
    if (!fs.existsSync(filePath)) {
        filePath = '../uploads/account/default/profileImage.png'
        //    return res.send('http://ssl.gstatic.com/accounts/ui/avatar_2x.png');
    }
    res.sendfile(path.resolve(filePath));
};


/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    User.findById(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json('user not found.');
        }
        user.email = req.body.email || '';
        user.username = req.body.username || '';
        user.firstName = req.body.firstName || '';
        user.lastName = req.body.lastName || '';
        user.profileImage = 'account/profileImage/' + req.body.username + '.jpg';
        if (!req.body.isFileImage) {
            //TODO check if url is valid
            user.profileImage = req.body.profileImage;
        } else {
            const dest = '../uploads/account/profileImage/';
            fs.rename(dest + req.sessionID + '.jpg',
                dest + req.body.username + '.jpg',
                function (err) {
                    if (err) {
                        debug('error rename profile image: ' + JSON.stringify(err));
                        return res.status(400).json(errors);
                    }
                });
        }
        user.save((err) => {
            if (err) {
                if (err.code === 11000) {
                    return res.status(400).json('The email address or username you have entered is already in use by other account.');
                }
                return next(err);
            }
            //to update session's user - req.user
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
            });
            res.json('Profile information has been updated.');
        });
    });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
    // req.assert('newPassword', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.newPassword);

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    User.findById(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json('user not found.');
        }
        user.comparePassword(req.body.oldPassword, (err, isMatch) => {
            if (err) {
                return res.status(400).json(err);
            }
            if (isMatch) {
                user.password = req.body.newPassword;
                user.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    return res.json('Password has been changed.');
                });
            }
            else {
                return res.status(400).send('Password is incorrect!!!');
            }
        });
    });
};

/**
 * POST /account/delete
 * Delete user account - mark 'isActive' = false.
 */
exports.postDeleteAccount = (req, res, next) => {
    User.findOne({_id: req.body._id, isActive: true}, (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json('user not found.');
        }
        user.isActive = false;
        user.save((err) => {
            if (err) {
                return next(err);
            }
            if (req.session.passport.user == user._id) {
                req.logout();
                req.session.destroy();
            }
            res.json('Account has been deleted.');
        });
    });
};

/**
 * GET /reset/:token
 * Reset Password Page.
 */
exports.getReset = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.status(401).send('unauthenticated');
    }
    User
        .findOne({passwordResetToken: req.params.token})
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.send('<h1 align="center" style="color:red">Password reset token is invalid or has expired.</h1><br><br>');
            }
            res.render('account/reset');
        });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
    // req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirmPassword', 'Passwords must match.').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    const resetPassword = () =>
        User
            .findOne({passwordResetToken: req.params.token})
            .where('passwordResetExpires').gt(Date.now())
            .then((user) => {
                if (!user) {
                    return res.status(400).json('Password reset token is invalid or has expired.');
                }
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                return user.save().then(() => new Promise((resolve, reject) => {
                    req.logIn(user, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(user);
                    });
                }));
            });

    const sendResetPasswordEmail = (user) => {
        if (!user) {
            return;
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'i0527630096@gmail.com',
                pass: pass
            }
        });
        const mailOptions = {
            to: user.email,
            from: 'i0527630096@gmail.com',
            subject: 'Your Folwer4u password has been changed',
            text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
        };
        return transporter.sendMail(mailOptions)
            .then(() => {
                res.send('Success! Your password has been changed.');
            });
    };

    resetPassword()
        .then(sendResetPasswordEmail)
        .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password Model.
 */
exports.getForgot = (req, res) => {
    if (req.isAuthenticated()) {
        return res.status(403).send('Forbidden');
    }
    res.render('account/forgot');
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    const createRandomToken = crypto
        .randomBytesAsync(16)
        .then(buf => {
            buf.toString('hex');
            setRandomToken(buf.toString('hex'));
        });

    const setRandomToken = token => {
        User.findOne({email: req.body.email})
            .then((user) => {
                if (!user) {
                    return res.status(400).json('Account with that email address does not exist.');
                }
                user.passwordResetToken = token;
                // user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                user.passwordResetExpires = Date.now() + 3600000 * 24; // 1 day
                usr = user.save(
                    () => {
                        sendForgotPasswordEmail(user);
                    }
                );
            });
    };

    const sendForgotPasswordEmail = (user) => {
        if (!user) {
            return;
        }
        const token = user.passwordResetToken;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'i0527630096@gmail.com',
                pass: pass
            }
        });
        const mailOptions = {
            to: user.email,
            from: 'i0527630096@gmail.com',
            subject: 'Reset your password on Flower4u',
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/#!/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions)
            .then((res1, err) => {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('info', {msg: `An e-mail has been sent to ${user.email} with further instructions.`});
                    res.json(req.flash('info'))
                }
            });
    };
    createRandomToken
        .catch(next);
};
