const mongoose = require('mongoose');

const likesSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    active: {
        type: Boolean,
        default: true
    },
    status_changed_at: {
        type: Date,
        default: Date.now()
    }
})

likesSchema.pre('save', function (next) {
    this.status_changed_at = Date.now();
    console.log("like status Save: " + this.created_at);
    next();
})

const likesModel = mongoose.model('Like', likesSchema);

module.exports = likesModel;