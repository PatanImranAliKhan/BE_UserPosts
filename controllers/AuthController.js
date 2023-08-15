const userModel = require('../models/UserModel');
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

const createAndSendToken = async (userDetails, res) => {
    try {
        var token = jwt.sign({ id: userDetails._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: 86400 // expires in 24 hours
        });
        return res.status(201).json({ Token: token });
    } catch (e) {
        return res.status(500).json({ Error: "Some Error caught with generating token" })
    }
}

exports.authenticate = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ Error: "Please provide both email and password" })
        }
        const userDetails = await UserModel.findOne({ email: email }).select("+password")
        if (!userDetails) {
            return res.status(400).json({ Error: "User Doesn't exist with this email" })
        }
        if (!(await userDetails.validateEncryptedPassword(password, userDetails.password))) {
            return res.status(400).json({ Error: "Incorrect Email or password" })
        }
        await createAndSendToken(userDetails, res);
    } catch (e) {
        return res.status(500).json({ Error: "Something Error caught while Authenticating user" })
    }
}

exports.singnup = async (req, res, next) => {
    try {
        const u = await UserModel.findOne({ email: req.body.email });
        if (u) {
            return res.status(400).json({ Error: "Email already in use" });
        }
        const newuser = await UserModel.create(req.body);
        await createAndSendToken(newuser, res);
    } catch (e) {
        return res.status(500).json({ Error: "Something Error caught while registering user" })
    }
}

exports.getall = async (req, res, next) => {
    try {
        const users = await UserModel.find({}).select("-__v -email");
        res.send(users)
    } catch (e) {
        return res.status(500).json({ Error: "Something Error caught while registering user" })
    }
}

exports.getUser = async (req,res,next) => {
    try {
        const userId = await this.verifyToken(req);
        if (!userId) {
            return res.status(401).json({ Error: "UnAuthorized" });
        }
        const userDetails = await userModel.findById(userId);
        res.status(201).json({
            "User Name": userDetails.username,
            "number of followers": userDetails.followers,
            "following":userDetails.following
        })
    } catch (e) {
        res.status(500).json({Error : "Caught Error while retriving the user profile details"})
    }
}