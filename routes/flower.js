const Folwer = require('../models/Flower');
const debug = require('debug')('ex6:flower');

/**
 * GET /flower
 * flowers page.
 */
exports.getFlower = (req, res) => {
    res.render('partials/flowers', {
        flower: req.flower
    });
};

/**
 * GET /flower/flowers
 * get all flowers details.
 */
exports.getFlowers = (req, res) => {
    Folwer.find({}, function (err, flowers) {
        if (err)
            res.status(400).json("get flowers failure: " + err);
        else
            res.json(flowers);
    });
};

/**
 * GET /flower/editFlower
 * Edit Flower Model.
 */
exports.getEditFlower = (req, res) => {
    if (!req.flower.role === 'Admin') {
        return res.status(403).json('No legacy access to ' + req.flower.role);
    }
    res.render('partials/flower', {
        title: 'Edit Flower',
    });
};

/**
 * POST /flower/updateFlower
 * update flower information.
 */
exports.postUpdateFlower = (req, res, next) => {
//TODO
};

/**
 * GET /flower/addFlower
 * Add Flower Model.
 */
exports.getAddFlower = (req, res) => {
    if (req.flower.role === 'Admin') {
        return res.status(403).json('No legacy access to ' + req.flower.role);
    }
    res.render('partials/flower', {
        title: 'Add Flower',
    });
};

/**
 * POST flower/addFlower
 * Create a new flower.
 */
exports.postAddFlower = (req, res, next) => {
//TODO
};