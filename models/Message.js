const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    author: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    // recipient: {
    //     kind: {type: String, enum: ['User', 'Group','allUsers'], default: 'allUsers'},
    //     id: {type: Schema.Types.ObjectId, refPath: 'recipient.kind'}
    // },
    // forAllUsers: {type: Boolean, default: false},
    // recipients: [{type: Schema.Types.ObjectId, ref: 'User'}],
    room: {
        kind: {type: String, enum: ['conversation', 'group', 'user', 'general', 'system'], default: 'General'},
        name: {type: Schema.Types.ObjectId, refPath: 'room.kind'}
    },
    // content: {
    //     type: {type: String, enum: ['files', 'filesUrl', 'links', 'filesUrl'], default: 'conversation'},
    //     item: {type: Schema.Types.ObjectId, refPath: 'room.kind'}
    // },
    type: {type: String, enum: ['text', 'file', 'fileUrl', 'link', 'joining', 'admin'], default: 'text'},
    content: {type: String, required: true},
    files: [{type: Schema.Types.ObjectId, ref: 'File'}],
    // filesUrl: [{type: mongoose.SchemaTypes.Url}],
    // links: [{type: mongoose.SchemaTypes.Url}],
    //TODO only a member in the above groups can comment like and opinion, and only one time
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    unlikes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    comments: [{
        like: Boolean,
        user: {type: Schema.Types.ObjectId, ref: 'User'}
    }],
    opinions: [{
        positive: Boolean,
        opinion: String,
        user: {type: Schema.Types.ObjectId, ref: 'User'}
    }],
    isActive: {type: Boolean, default: true},
}, {timestamps: true, usePushEach: true });

module.exports = mongoose.model('Message', MessageSchema);