const User = require('../models/user')
const Post = require('../models/post')
const bcrypt = require('bcryptjs')
const validator = require('validator')

module.exports = {
	user: args => User.findById(args._id).populate('posts'),
	post: args => Post.findById(args._id).populate('creator'),
	posts: () => Post.find().populate('creator'),
	createUser: async ({ input }, req) => {
		const errors = []
		if (!validator.isEmail(input.email)) {
			errors.push({ message: 'Invalid Email Address' })
		}
		if (
			validator.isEmpty(input.password) ||
			!validator.isLength(input.password, { min: 5 })
		) {
			errors.push({ message: 'Invalid Password' })
		}
		if (errors.length > 0) {
			const error = new Error('Invalid Input')
			error.data = errors
			error.code = 422
			throw error
		}
		const exist = await User.findOne({ email: input.email })
		if (exist) {
			throw new Error('User Already Exist')
		}
		const password = await bcrypt.hash(input.password, 12)
		const user = new User({ ...input, password })
		const savedUser = await user.save()
		return { ...savedUser._doc, _id: savedUser._id.toString() }
	}
}
