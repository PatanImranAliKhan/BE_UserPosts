const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken')

exports.verifyToken = async (req) => {
    var token = req.headers['x-access-token'];
    if (!token) {
        return false;
    }
    let respData = null;
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, data) {
        if (err) return false;
        respData = data.id;
    });
    return respData
}

const createAndSendToken = async (userDetails, message, res) => {
    try {
        var token = jwt.sign({ id: userDetails._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: 86400 // expires in 24 hours
        });
        return res.status(200).json({ message: message, token: token });
    } catch (e) {
        return res.status(403).json({ message: "Some Error caught with generating token" })
    }
}

exports.authenticate = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" })
        }
        const userDetails = await UserModel.findOne({ email: email }).select("+password")
        console.log("user detaiks: " + userDetails)
        if (!userDetails) {
            return res.status(400).json({ message: "User Doesn't exist with this email" })
        }
        if (!(await userDetails.validateEncryptedPassword(password, userDetails.password))) {
            return res.status(400).json({ message: "Incorrect Email or password" })
        }
        const message = "Successfully Logged in"
        await createAndSendToken(userDetails, message, res);
    } catch (e) {
        return res.status(403).json({ message: "Something Error caught while Authenticating user" })
    }
}

exports.singnup = async (req, res, next) => {
    try {
        const u = await UserModel.findOne({ email: req.body.email });
        if (u) {
            return res.status(400).json({ message: "Email already in use" });
        }
        const newuser = await UserModel.create(req.body);
        await createAndSendToken(newuser, "Successfulluy registered", res);
    } catch (e) {
        return res.status(403).json({ message: "Something Error caught while registering user" })
    }
}

exports.getall = async (req, res, next) => {
    try {
        const u = await UserModel.find({});
        res.send(u)
    } catch (e) {
        return res.status(403).json({ message: "Something Error caught while registering user" })
    }
}