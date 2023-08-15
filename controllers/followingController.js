const FollowingModel = require('../models/FollowingModel');
const UserModel = require('../models/UserModel');
const authController = require('./AuthController');

const checkFollowing = async (userId, followerId) => {
    try {
        const followerData = await FollowingModel.findOne({ 'userId': { _id: userId }, 'followerId': { _id: followerId } }).select("+active")
        return followerData;
    } catch (e) {
        return false;
    }
}

const verifyFollowingUser = async (userId) => {
    try {
        const u = await UserModel.findById(userId);
        if (u) return true;
        return false;
    } catch (e) {
        return false;
    }
}

exports.followUser = async (req, res, next) => {
    try {
        const id = req.params['id']
        const userId = await authController.verifyToken(req);
        if (id === userId) {
            return res.status(201).json({ message: "The Id provided was same as your userId" })
        }
        const followerData = await checkFollowing(userId, id);
        if (!id || !(await verifyFollowingUser(id))) {
            return res.status(400).json({ message: "ID was incorrect, provide proper UserId" })
        }
        if (followerData && followerData.active == true) {
            return res.status(200).json({ message: "You are already following the user" });
        } else if (followerData) {
            followerData.active = true;
            await followerData.save();
            return res.status(200).json({ message: "Following Detail Saved" })
        }
        const obj = {
            userId: userId,
            followerId: id
        }
        let followingDetails = await FollowingModel.create(obj);
        followingDetails = await followingDetails.populate('userId followerId')
        const userDetails = followingDetails.userId;
        userDetails.following = userDetails.following + 1;
        userDetails.save();
        const followerIdDetails = followingDetails.followerId;
        followerIdDetails.followers = followerIdDetails.followers + 1;
        followerIdDetails.save();
        console.log("Following Details saved " + followingDetails);
        return res.status(201).json({ message: "Following Detail Saved" });
    } catch (e) {
        return res.status(400).json({ message: "Something Error caught on Following user, please try after some time" })
    }
}

exports.unfollowUser = async (req, res, next) => {
    try {
        const id = req.params['id'];
        const userId = await authController.verifyToken(req);
        if (id === userId) {
            return res.status(201).json({ message: "The Id provided was same as your userId." })
        }
        if (!id) {
            return res.status(400).json({ message: "Id was not provided" })
        }
        const followerData = await checkFollowing(userId, id);
        if (!followerData) {
            return res.status(200).json({ message: "You are not following the User to unfollow" });
        }
        followerData.active = false;
        let followingDetails = await followerData.save()

        followingDetails = await followingDetails.populate('userId followerId')
        const userDetails = followingDetails.userId;
        userDetails.following = userDetails.following - 1;
        userDetails.save();
        const followerIdDetails = followingDetails.followerId;
        followerIdDetails.followers = followerIdDetails.followers - 1;
        followerIdDetails.save();

        return res.status(200).json({ message: "unfollowed Successfully" });
    } catch (e) {
        return res.status(400).json({ message: "Something Error caught on unFollowing user, please try after some time" })
    }
}