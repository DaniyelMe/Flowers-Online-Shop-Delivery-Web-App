const debug = require('debug')('ex6:routes-index');
const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const multer = require('../utilities/multer');
const account = require('./account');
const user = require('./user');
const flower = require('./flower');
const chat = require('./chat');

/**
 * Primary app routes.
 */
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Flower4u'});
});

/* account - guest. */
router.get('/session/user', account.getUser);
router.get('/login', account.getLogin);
router.post('/login', account.postLogin);
router.get('/logout', account.logout);
router.post('/logout', account.logout);
router.get('/forgot', account.getForgot);
router.post('/forgot', account.postForgot);
router.get('/reset/:token', account.getReset);
router.post('/reset/:token', account.postReset);
router.get('/register', account.getRegister);
router.post('/register', account.postRegister);
router.post('/register/profileImage', multer.uploadProfileImage);

/* account - user. */
router.get('/account', passport.isAuthenticated, account.getAccount);
router.post('/account/profile', passport.isAuthenticated, account.postUpdateProfile);
router.get('/account/profileImage/:username', passport.isAuthenticated, account.getProfileImage);
router.post('/account/profileImage', passport.isAuthenticated, multer.uploadProfileImage);
router.post('/account/password', passport.isAuthenticated, account.postUpdatePassword);
router.post('/account/delete', passport.isAuthenticated, account.postDeleteAccount);

/* user management. */
router.get('/user', passport.isAuthenticated, user.getUser);
router.get('/user/users', passport.isAuthenticated, user.getUsers);
router.get('/user/editUser', passport.isAuthenticated, user.getEditUser);
router.post('/user/updateUser', passport.isAuthenticated, user.postUpdateUser);
router.get('/user/addUser', passport.isAuthenticated, user.getAddUser);
router.post('/user/registerAdmin', passport.isAuthenticated, user.postRegisterAdmin);

/* flower. */
router.get('/flower', passport.isAuthenticated, flower.getFlower);
router.get('/flower/flowers', passport.isAuthenticated, flower.getFlowers);
router.post('/flower/flowerImage', passport.isAuthenticated, multer.upload);
router.get('/flower/editFlower', passport.isAuthenticated, flower.getEditFlower);
router.post('/flower/updateFlower', passport.isAuthenticated, flower.postUpdateFlower);
router.get('/flower/addFlower', passport.isAuthenticated, flower.getAddFlower);
router.post('/flower/addFlower', passport.isAuthenticated, flower.postAddFlower);

/* chat. */
router.get('/chat', passport.isAuthenticated, chat.getChat);
router.get('/chat/messages', passport.isAuthenticated, chat.getMessages);
router.post('/chat/AddConversation', passport.isAuthenticated, chat.postAddConversation);
router.get('/chat/groups', passport.isAuthenticated, chat.getGroups);
router.get('/chat/groupsToJoin', passport.isAuthenticated, chat.getGroupsToJoin);
router.get('/chat/groupsManage', passport.isAuthenticated, chat.getGroupsManage);

module.exports = router;