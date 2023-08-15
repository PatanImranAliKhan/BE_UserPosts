const LikesModel = require('../models/LikesModel')
const PostModel = require('../models/PostsModel');
const authController = require('./AuthController');

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

/**
 * Verifying whether provided postId was valid or not
 * @param postId 
 * @returns 
 */
const verifyPostWithId = async (postId) => {
    try {
        return await PostModel.findById(postId);
    } catch (e) {
        return false;
    }
}


exports.likePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = await authController.verifyToken(req);
        if (!userId) {
            return res.status(403).json({ message: "UnAuthorized" });
        }
        if (!(await verifyPostWithId(postId))) {
            return res.status(403).json({ message: "Invalid PostId, provide valid PostID" });
        }
        const likedResult = await verifyLikedStatus(userId, postId);
        if (likedResult && likedResult.active === true) {
            return res.status(201).json({ message: "Already liked the post" });
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
        res.status(201).json({ message: "Liked the Post with Id : " + postId });
    } catch (e) {
        res.status(403).json({ message: "caught something Error while liking the Post " + e });
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
            return res.status(403).json({ message: "UnAuthorized" });
        }
        if (!(await verifyPostWithId(postId))) {
            return res.status(403).json({ message: "Invalid PostId, provide valid PostID" });
        }
        const likedResult = await verifyLikedStatus(userId, postId);
        if (!likedResult || likedResult.active === false) {
            return res.status(201).json({ message: "You have not liked the post to unlike" });
        }
        let finalLikedResult = null;
        likedResult.active = false;
        finalLikedResult = await likedResult.save();

        finalLikedResult = await finalLikedResult.populate("postId");
        await updatePostsLikedData(finalLikedResult, -1);
        res.status(201).json({ message: "UnLiked the Post with Id : " + postId });
    } catch (e) {
        res.status(403).json({ message: "caught something Error while liking the Post " + e });
    }
}