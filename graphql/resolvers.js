const User = require('../models/user')
const Post = require('../models/post')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const ObjectId = require('mongoose').Types.ObjectId
const path = require('path')

const deleteFile = require('../util/deleteFile')

module.exports = {
	getStatus: async (args, req) => {
		try {
			const user = await User.findById(req.userId)
			return user.status
		} catch (err) {
			throw err
		}
	},
	updateStatus: async ({ status }, req) => {
		try {
			const user = await User.findById(req.userId)
			user.status = status
			await user.save()
			return 'Update Successfully'
		} catch (err) {
			throw err
		}
	},
	createPost: async ({ input }, req) => {
		try {
			if (!req.isAuth) {
				const err = new Error('Not Authorized')
				err.code = 401
				throw err
			}
			const errors = []
			if (!validator.isLength(input.title, { min: 5 })) {
				errors.push({ message: 'Title too short' })
			}

			if (errors.length > 0) {
				const err = new Error('Validation Failed')
				err.code = 401
				err.data = errors
				throw err
			}

			const user = await User.findById(req.userId)
			const post = new Post({ ...input, creator: user._id })
			const savedPost = await post.save()
			user.posts.push(savedPost._id)
			const savedUser = await user.save()
			return {
				...savedPost._doc,
				_id: savedPost._id.toString(),
				creator: savedUser._doc,
				createdAt: savedPost.createdAt.toISOString(),
				updatedAt: savedPost.updatedAt.toISOString()
			}
		} catch (err) {
			throw err
		}
	},
	post: async ({ id }) => {
		try {
			const post = await Post.findById(id).populate('creator')
			return {
				...post._doc,
				_id: post._id.toString(),
				createdAt: post.createdAt.toISOString()
			}
		} catch (err) {
			throw err
		}
	},
	posts: async ({ page }, req) => {
		try {
			if (!req.isAuth) {
				const err = new Error('Not Authorized')
				err.code = 401
				throw err
			}
			const curPage = page || 1
			const perPage = 2
			const totalPosts = await Post.find().countDocuments()
			const posts = await Post.find()
				.skip((curPage - 1) * perPage)
				.limit(perPage)
				.sort({ createdAt: -1 })
				.populate('creator')

			return {
				posts: posts.map(item => ({
					...item._doc,
					_id: item._id.toString(),
					createdAt: item.createdAt.toISOString()
				})),
				totalPosts
			}
		} catch (err) {
			throw err
		}
	},
	updatePost: async ({ input, id }, req) => {
		try {
			const post = await Post.findOne({
				_id: ObjectId(id),
				creator: ObjectId(req.userId)
			}).populate('creator')
			if (input.title) post.title = input.title
			if (input.imgUrl) post.imgUrl = input.imgUrl
			if (input.content) post.content = input.content
			const savedPost = await post.save()
			return {
				...savedPost._doc,
				_id: savedPost._id.toString(),
				createdAt: savedPost.createdAt.toISOString()
			}
		} catch (err) {
			throw err
		}
	},
	deletePost: async ({ id }, req) => {
		try {
			const user = await User.findById(req.userId)
			user.posts.pull(ObjectId(id))
			await user.save()
			const post = await Post.findOne({
				_id: ObjectId(id),
				creator: ObjectId(req.userId)
			})
			const filePath = path.join(__dirname, '..', post.imgUrl)
			deleteFile(filePath)
			await Post.deleteOne({ _id: ObjectId(id), creator: ObjectId(req.userId) })
			return 'Deleted Successfully'
		} catch (err) {
			throw err
		}
	},
	createUser: async ({ input }) => {
		try {
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
		} catch (err) {
			throw err
		}
	},
	login: async ({ email, password }) => {
		try {
			const errors = []
			if (!validator.isEmail(email)) {
				errors.push({ message: 'Invalid Email Address' })
			}
			if (
				validator.isEmpty(password) ||
				!validator.isLength(password, { min: 5 })
			) {
				errors.push({ message: 'Invalid Password' })
			}
			if (errors.length > 0) {
				const error = new Error('Invalid Input')
				error.data = errors
				error.code = 422
				throw error
			}
			const user = await User.findOne({ email })
			if (!user) {
				const error = new Error('No Such User')
				error.code = 401
				throw error
			}
			const match = await bcrypt.compare(password, user.password)
			if (!match) {
				const error = new Error('Password Does Not Match')
				error.code = 401
				throw error
			}
			const token = jwt.sign(
				{
					email,
					userId: user._id.toString()
				},
				'thisstringshouldbeaslongaspossibles',
				{ expiresIn: '10h' }
			)
			return { token, userId: user._id.toString() }
		} catch (err) {
			throw err
		}
	}
}
