const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require("validator")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    },
    followers: {
        type: Number,
        default: 0
    },
    following: {
        type: Number,
        default: 0
    }
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.validateEncryptedPassword = async function (userPassword, encryptedPassword) {
    return await bcrypt.compare(userPassword, encryptedPassword);
}

const userModel = new mongoose.model('User', userSchema);

module.exports = userModel;