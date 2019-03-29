const express = require('express')
const { body } = require('express-validator/check')

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/isAuth')
const router = express.Router()

router.get('/user', isAuth, feedController.getUser)

router.put('/user', isAuth, feedController.putUser)

router.get('/post/:postId', isAuth, feedController.getPost)

router.get('/posts', isAuth, feedController.getPosts)

router.post(
	'/post',
	isAuth,
	[
		body('title')
			.trim()
			.isLength({ min: 5 }),
		body('content')
			.trim()
			.isLength({ min: 5 })
	],
	feedController.postPost
)

router.put(
	'/post/:postId',
	isAuth,
	[
		body('title')
			.trim()
			.isLength({ min: 5 }),
		body('content')
			.trim()
			.isLength({ min: 5 })
	],
	feedController.putPost
)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router
