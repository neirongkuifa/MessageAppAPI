const express = require('express')
const { body } = require('express-validator/check')

const authController = require('../controllers/auth')
const User = require('../models/user')

const router = express.Router()

router.post(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Email Address Not Valid')
			.custom(async (value, { req }) => {
				const user = await User.findOne({ email: value })
				if (user) {
					console.log('Here')
					throw new Error('User already exists')
				}
				return true
			})
			.normalizeEmail(),
		body('password')
			.trim()
			.isLength({ min: 6 }),
		body('name')
			.trim()
			.not()
			.isEmpty()
	],
	authController.postSignup
)

router.post(
	'/login',
	[
		body('email')
			.isEmail()
			.withMessage('Email Address Not Valid')
			.normalizeEmail(),
		body('password')
			.trim()
			.isLength({ min: 6 })
	],
	authController.postLogin
)

module.exports = router
