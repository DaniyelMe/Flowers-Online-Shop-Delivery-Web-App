const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const base64 = require('../config/base64')

const roleValidate = {
    validator: x => /^Admin|Employee|Provider|Customer$/.test(x),
    message: "{VALUE} is not a legal role."
};

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    // password: {type: String, select: false},
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    email: {type: String, required: true, unique: true},
    // role: {type: String, enum: ['Admin', 'Worker', 'Customer', 'Provider'], default: 'Customer'},
    role: {type: String, required: true, validate: roleValidate, default: 'Customer'},
    flowers: [{type: Schema.Types.ObjectId, ref: 'Flower'}],
    branch: [{type: Schema.Types.ObjectId, ref: 'Branch'}],
    activated: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},

    google: String,
    github: String,
    linkedin: String,
    tokens: Array,

    firstName: String,
    lastName: String,
    address: String,
    gender: String,
    location: String,
    website: String,
    profileImage: String,
    // profileImage: {type: String, default: 'account/profileImage'}
}, {timestamps: true});


/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        // bcrypt.hash(base64.decode(user.password), salt, null, (err, hash) => {
        // user.password = base64.decode(user.password);
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        // bcrypt.compare(base64.decode(candidatePassword), this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};


const User = mongoose.model('User', userSchema);

module.exports = User;
