const LikesModel = require('../models/LikesModel');
const authController = require('./AuthController');
const pathController = require('./postsController');

/**
 * Verifyig previous like status for provided post with User details
 * @param userId 
 * @param postId 
 * @returns 
 */
const verifyLikedStatus = async (userId, postId) => {
    try {
        return LikesModel.findOne({ userId: { _id: userId }, postId: { _id: postId } });
    } catch (e) {
        return false;
    }
}

exports.likePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(401).json({ Error: "UnAuthorized" });
        }
        if (!(await pathController.verifyPostWithId(postId))) {
            return res.status(400).json({ Error: "Invalid PostId, provide valid PostID" });
        }
        const likedResult = await verifyLikedStatus(userId, postId);
        if (likedResult && likedResult.active === true) {
            return res.status(200).json({ Message: "Already liked the post" });
        }
        let finalLikedResult = null;
        if (likedResult) {
            likedResult.active = true;
            finalLikedResult = await likedResult.save();
        } else {
            const obj = {
                userId: userId,
                postId: postId,
                active: true
            }
            finalLikedResult = await LikesModel.create(obj);
        }
        finalLikedResult = await finalLikedResult.populate("postId");
        await updatePostsLikedData(finalLikedResult, 1);
        res.status(200).json({ Message: "Liked the Post with Id : " + postId });
    } catch (e) {
        res.status(500).json({ Error: "caught something Error while liking the Post " + e });
    }
}

/**
 * Update user details by incrementing and decrementing the likes data.
 * Increment the likes only when user calls the like API
 * Decrement the likes only when user calls the unlike API
 * @param finalLikedResult 
 * @param value 
 */
const updatePostsLikedData = async (finalLikedResult, value) => {
    let postDetails = finalLikedResult.postId
    postDetails.likes = postDetails.likes + value;
    await postDetails.save();
}

exports.unLikePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(401).json({ Error: "UnAuthorized" });
        }
        if (!(await pathController.verifyPostWithId(postId))) {
            return res.status(400).json({ Error: "Invalid PostId, provide valid PostID" });
        }
        const likedResult = await verifyLikedStatus(userId, postId);
        if (!likedResult || likedResult.active === false) {
            return res.status(200).json({ Message: "You have not liked the post to unlike" });
        }
        let finalLikedResult = null;
        likedResult.active = false;
        finalLikedResult = await likedResult.save();

        finalLikedResult = await finalLikedResult.populate("postId");
        await updatePostsLikedData(finalLikedResult, -1);
        res.status(200).json({ Message: "UnLiked the Post with Id : " + postId });
    } catch (e) {
        res.status(500).json({ Error: "caught something Error while liking the Post " + e });
    }
}