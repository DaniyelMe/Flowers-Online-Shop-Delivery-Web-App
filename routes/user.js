const User = require('../models/User');


/**
 * GET /user
 * user page.
 */
exports.getUser = (req, res) => {
    if (!req.user.role === 'Admin') {
        return res.status(403).json('No legacy access to ' + req.user.role);
    }
    res.render('partials/users', {
        user: req.user
    });
};

/**
 * GET /user/users
 * get all users account.
 */
exports.getUsers = (req, res) => {
    let WhereFields = {};
    let ProjectFields = {username: 1, email: 1, firstName: 1, lastName: 1, branchId: 1, flowersIds: 1}
    if (req.user.role === 'Admin') {
        ProjectFields = {};
    }
    else if (req.user.role === 'Employee') {
        WhereFields.isActive = true;
        WhereFields.role = 'Customer';
    }
    else {
        return res.status(400).json('No legacy access to ' + req.user.role);
    }
    User.find(WhereFields, ProjectFields, function (err, users) {
        if (err)
            res.status(400).json("get flowers failure: " + err);
        else
            res.json(users);
    });
};

/**
 * GET /user/editUser
 * Edit User Model.
 */
exports.getEditUser = (req, res) => {
    if (!req.user.role === 'Admin') {
        return res.status(403).json('No legacy access to ' + req.user.role);
    }
    res.render('account/user', {
        title: 'Edit User',
    });
};

/**
 * POST /user/updateUser
 * update user information.
 */
exports.postUpdateUser = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }
    User.findById(req.body._id, (err, user) => {
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
        user.isActive = req.body.isActive || '';
        user.activated = req.body.activated || '';
        user.save((err) => {
            if (err) {
                if (err.code === 11000) {
                    return res.status(400).json('The email address or username you have entered is already in use by other account.');
                }
                return next(err);
            }
            res.json('Profile information has been updated.');
        });
    });
};

/**
 * GET /user/addUser
 * Add User Model.
 */
exports.getAddUser = (req, res) => {
    if (req.user.role === 'Admin') {
        return res.status(403).json('No legacy access to ' + req.user.role);
    }
    res.render('account/user', {
        title: 'Add User',
    });
};

/**
 * POST user/registerAdmin
 * Create a new local account in admin mode.
 */
exports.postRegisterAdmin = (req, res, next) => {
    // req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.assert('email', 'Email is not valid').isEmail();
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
        role: req.body.role,
        activated: req.body.activated,
        isActive: req.body.isActive
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
                return res.status(400).json('Account with that email address already exists.');
            }
            user.save((err) => {
                if (err) {
                    return next(err);
                }
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                    res.json(req.flash('success create account!'));
                });
            });
        });
    });
};