const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema defines how chat messages will be stored in MongoDB
const GroupSchema = new Schema({
    name: {type: String, require: true, unique: true},
    admin: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
    isActive: {type: Boolean, default: true}
}, {timestamps: true});

module.exports = mongoose.model('Group', GroupSchema);
