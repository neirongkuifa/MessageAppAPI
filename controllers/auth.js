const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator/check')

const User = require('../models/user')

exports.postSignup = async (req, res, next) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			console.log(errors.array())
			const err = new Error('Validation failed.')
			err.httpStatusCode = 422
			throw err
		}

		const email = req.body.email
		const name = req.body.name
		const rawPassword = req.body.password
		const password = await bcrypt.hash(rawPassword, 12)

		const user = new User({
			email,
			name,
			password
		})

		const savedUser = await user.save()
		res
			.status(200)
			.json({ message: 'Successfully signed up.', userId: savedUser._id })
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}

exports.postLogin = async (req, res, next) => {
	try {
		console.log('Here')
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			console.log(errors.array())
			const err = new Error('Validation failed.')
			err.httpStatusCode = 422
			throw err
		}

		const email = req.body.email
		const rawPassword = req.body.password

		const user = await User.findOne({ email })
		if (!user) {
			const err = new Error('No such User')
			err.httpStatusCode = 422
			throw err
		}
		const match = await bcrypt.compare(rawPassword, user.password)
		if (!match) {
			const err = new Error('Wrong Password')
			err.httpStatusCode = 422
			throw err
		}
		const token = jwt.sign(
			{ email: user.email, userId: user._id.toString() },
			'hardtoguessthissecret',
			{ expiresIn: '1h' }
		)
		res
			.status(200)
			.json({
				message: 'Login Successfully',
				token,
				userId: user._id.toString()
			})
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}
