const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, "Please provide a title"]
    },
    description: {
        type: String,
        required: [true, "Please provide description"]
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [String],
    created_at: {
        type: Date
    },
    active_status: {
        type: Boolean,
        default: true,
        select: false
    }
})

postSchema.pre('save', function (next) {
    this.created_at = Date.now();
    console.log("Posts Save: " + this.created_at);
    next();
})

postSchema.pre(/^find/, function (next) {
    this.find({ active_status: true });
    next()
})

const postModel = new mongoose.model('Post', postSchema);

module.exports = postModel;