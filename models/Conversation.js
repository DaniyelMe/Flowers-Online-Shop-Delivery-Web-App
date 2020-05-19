const mongoose = require('mongoose'),
    Schema = mongoose.Schema;


const notEmpty = {
    validator: array => array.length > 0,
    message: 'Please add at least one participant'
};

// Schema defines how chat messages will be stored in MongoDB
const conversationSchema = new Schema({
    name: String,
    forAllUsers: {type: Boolean, default: false},
    participants: {type:[{type: Schema.Types.ObjectId, ref: 'User'}], required: true, validate: notEmpty},
    isActive: {type: Boolean, default: true}
}, {timestamps: true});

module.exports = mongoose.model('Conversation', conversationSchema);
