const commentModel = require('../models/CommentsModel');
const authController = require('./AuthController');
const pathController = require('./postsController');

exports.addComment = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(401).json({ Error: "UnAuthorized" });
        }
        if (!(await pathController.verifyPostWithId(postId))) {
            return res.status(400).json({ Error: "Invalid postId, please provide valid postId" });
        }
        req.body.postId = postId;
        req.body.userId = userId;
        let commentResponse = await commentModel.create(req.body);
        const commentId = commentResponse._id;
        commentResponse = await commentResponse.populate('postId');

        // Pushing comment to Post Model
        let postDetails = commentResponse.postId;
        postDetails.comments.push(req.body.comment);
        await postDetails.save();

        res.status(201).json({ "Comment-ID": commentId  });
    } catch (e) {
        res.status(500).json({ Error: "Caught something Error while adding post comment " + e })
    }
}