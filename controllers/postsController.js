const PostModel = require('../models/PostsModel');
const authController = require('./AuthController');

/**
 * Verifying whether provided postId was valid or not
 * @param postId 
 * @returns 
 */
exports.verifyPostWithId = async (postId) => {
    try {
        return await PostModel.findById(postId);
    } catch (e) {
        return false;
    }
}

exports.addPost = async (req, res, next) => {
    try {
        const userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(401).json({ Error: "UnAuthorized" })
        }
        req.body.userId = userId;
        const newpost = await PostModel.create(req.body);
        const created_time = newpost.created_at.toUTCString();
        res.status(201).json({ "Post-ID": newpost._id, Title: newpost.title, Description: newpost.description, "Created Time(UTC)": created_time })
    } catch (e) {
        return res.status(500).json({ Error: "Something Error while adding post " + e })
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(401).json({ Error: "UnAuthorized" })
        }
        let postData = await PostModel.findById(postId)
        if (!postData) {
            return res.status(400).json({ Error: "Invalid Post-Id or Post was deleted already" })
        }
        if (postData.userId != userId) {
            return res.status(400).json({ Error: "you dont have access to delete the post, it was added by other user" })
        }
        postData.active_status = false;
        await postData.save();
        res.status(201).json({ Message: "Post was deleted Successfully" })
    } catch (e) {
        return res.status(500).json({ Error: "Something Error while deleting post " + e })
    }
}

exports.all_posts = async (req, res, next) => {
    try {
        let userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(401).json({ Error: "UnAuthorized" })
        }
        const allPosts = await PostModel.find({}).select("-userId -__v")
        res.status(200).send(allPosts)
    } catch (e) {
        return res.status(500).json({ Error: "Something Error while retrieving all post " + e })
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(401).json({ Error: "UnAuthorized" });
        }
        if(!(await this.verifyPostWithId(postId))) {
            return res.status(400).json({ Error: "Invalid postId, please provide valid postId" });
        }
        const postDetails = await PostModel.findById(postId);
        res.status(200).json({
            id: postDetails._id,
            title: postDetails.title,
            description: postDetails.description,
            created_at: postDetails.created_at,
            comments: postDetails.comments,
            likes: postDetails.likes
        })
    } catch (e) {
        return res.status(500).json({ Error: "Something Error while retrieving all post " + e })
    }
}