const PostModel = require('../models/PostsModel');
const authController = require('./AuthController');

exports.addPost = async (req, res, next) => {
    try {
        console.log(req.body);
        const userId = await authController.verifyToken(req);
        console.log("userId  " + userId)
        if (!userId) {
            return res.status(403).json({ message: "UnAuthorized" })
        }
        req.body.userId = userId;
        const newpost = await PostModel.create(req.body);
        console.log(newpost)
        const created_time = newpost.created_at.toUTCString();
        res.status(201).json({ "Post-ID": newpost._id, title: newpost.title, description: newpost.description, "Created Time(UTC)": created_time })
    } catch (e) {
        return res.status(403).json({ message: "Something Error while adding post " + e })
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(403).json({ message: "UnAuthorized" })
        }
        let postData = await PostModel.findById(postId)
        if (!postData) {
            return res.status(400).json({ message: "Invalid Post-Id or Post was deleted already" })
        }
        if (postData.userId != userId) {
            return res.status(400).json({ message: "you dont have access to delete the post, it was added by other user" })
        }
        postData.active_status = false;
        await postData.save();
        res.status(201).json({ message: "Post was deleted Successfully" })
    } catch (e) {
        return res.status(403).json({ message: "Something Error while deleting post " + e })
    }
}

exports.all_posts = async (req, res, next) => {
    try {
        let userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(403).json({ message: "UnAuthorized" })
        }
        const allPosts = await PostModel.find({});
        res.send(allPosts)
    } catch (e) {
        return res.status(403).json({ message: "Something Error while retrieving all post " + e })
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(403).json({ message: "UnAuthorized" })
        }
        const postDetails = await PostModel.findById(postId);
        res.send(postDetails)
    } catch (e) {
        return res.status(403).json({ message: "Something Error while retrieving all post " + e })
    }
}