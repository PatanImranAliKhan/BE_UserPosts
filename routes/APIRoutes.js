const express = require('express');
const router = express.Router();

const authController = require('../controllers/AuthController');

const postController = require('../controllers/postsController');

const followingController = require('../controllers/followingController')


router.post('/authenticate', authController.authenticate);
router.post('/signup', authController.singnup);
router.get('/', authController.getall);

router.post('/posts', postController.addPost);
router.delete('/posts/:id', postController.deletePost);
router.get('/all_posts', postController.all_posts);
router.get('/posts/:id', postController.getPost);

router.post('/follow/:id', followingController.followUser);
router.post('/unfollow/:id', followingController.unfollowUser);

module.exports = router;