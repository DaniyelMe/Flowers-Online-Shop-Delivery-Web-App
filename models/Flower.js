const mongoose = require('mongoose');

const flowerSchema = mongoose.Schema({
    name: {type: String, require: true},
    color: {type: String, require: true},
    imageUrl: {type: String, require: true},
    price: {type: Number, require: true},
    isActive: {type: Boolean, default: true}
}, {timestamps: true});

const Flower = mongoose.model('Flower', flowerSchema);

module.exports = Flower;