const mongoose = require('mongoose');

const followingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    followerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    status_changed_at: {
        type: Date,
        default: Date.now(),
        select: false
    }
})

followingSchema.pre('save', function (next) {
    this.status_changed_at = Date.now();
    next();
})

const followingModel = new mongoose.model('Following', followingSchema);

module.exports = followingModel;