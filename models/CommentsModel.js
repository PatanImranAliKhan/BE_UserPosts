const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    comment: {
        type: String,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

const commentModel = new mongoose.model('Comment', commentSchema);
module.exports = commentModel;