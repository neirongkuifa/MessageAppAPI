const { validationResult } = require('express-validator/check')
const ObjectId = require('mongoose').Types.ObjectId
const deleteFile = require('../util/deleteFile')
const path = require('path')

const Post = require('../models/post')
const User = require('../models/user')
const io = require('../socket')

const ITEMS_PER_PAGE = 2

exports.getUser = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId)
		if (!user) {
			const err = new Error('No Such User')
			err.httpStatusCode = 422
			throw err
		}
		res
			.status(200)
			.json({ message: 'Successfully Received Status', status: user.status })
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}

exports.putUser = async (req, res, next) => {
	console.log(req.body.userStatus)
	try {
		const user = await User.findById(req.userId)
		if (!user) {
			const err = new Error('No Such User')
			err.httpStatusCode = 422
			throw err
		}
		user.status = req.body.userStatus
		await user.save()
		res.status(200).json({ message: 'Status Updated' })
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}

exports.getPost = async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.postId).populate('creator')
		if (!post) {
			const err = new Error('Could not find post')
			err.httpStatusCode = 404
			throw err
		}
		res.status(200).json({ message: 'sucess', post })
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}

exports.getPosts = async (req, res, next) => {
	try {
		const page = req.query.page || 1
		const totalItems = await Post.find().countDocuments()
		const posts = await Post.find()
			.populate('creator')
			.sort({ createdAt: -1 })
			.skip((page - 1) * ITEMS_PER_PAGE)
			.limit(ITEMS_PER_PAGE)

		if (!posts) {
			const err = new Error('Could not find post')
			err.httpStatusCode = 404
			throw err
		}
		res.status(200).json({ message: 'fetched', posts, totalItems })
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}

exports.postPost = async (req, res, next) => {
	try {
		if (!req.file) {
			const error = new Error('Image is not provided')
			error.httpStatusCode = 422
			throw error
		}

		const imgUrl = req.file.path
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			const error = new Error('Validation Error')
			error.httpStatusCode = 402
			throw error
		}
		const title = req.body.title
		const content = req.body.content
		const post = new Post({
			title,
			content,
			imgUrl,
			creator: ObjectId(req.userId)
		})
		const savedPost = await post.save()
		const user = await User.findById(req.userId)
		user.posts.push(savedPost._id)
		const savedUser = await user.save()

		io.getIO().emit('post', {
			action: 'create',
			post: { ...savedPost._doc, creator: savedUser }
		})

		res.status(201).json({
			message: 'Post Created Successfully',
			post,
			creator: {
				_id: savedPost._id,
				name: savedPost.name
			}
		})
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}

exports.putPost = async (req, res, next) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			const err = new Error('Validation Failed')
			err.httpStatusCode = 422
			throw err
		}

		const post = await Post.findOne({
			_id: ObjectId(req.params.postId),
			creator: ObjectId(req.userId)
		}).populate('creator')
		if (!post) {
			const err = new Error('No Such Post')
			err.httpStatusCode = 404
			throw err
		}

		if (req.file) {
			const filePath = path.join(__dirname, '..', post.imgUrl)
			deleteFile(filePath)
			post.imgUrl = req.file.path
		}

		post.title = req.body.title
		post.content = req.body.content

		const savedPost = await post.save()

		io.getIO().emit('post', { action: 'update', post: savedPost })

		res.status(200).json({ message: 'Post Updated!', post })
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}

exports.deletePost = async (req, res, next) => {
	try {
		const post = await Post.findOne({
			_id: ObjectId(req.params.postId),
			creator: ObjectId(req.userId)
		})
		if (!post) {
			const err = new Error('No such Post')
			err.httpStatusCode = 404
			throw err
		}
		const user = await User.findOne({ _id: ObjectId(req.userId) })
		user.posts.pull(post._id)
		await user.save()
		const filePath = path.join(__dirname, '..', post.imgUrl)
		deleteFile(filePath)
		await Post.deleteOne({ _id: ObjectId(req.params.postId) })

		io.getIO().emit('post', { action: 'delete', post: post._id })

		res.status(200).json({ message: 'Post Deleted!' })
	} catch (err) {
		if (!err.httpStatusCode) {
			err.httpStatusCode = 500
		}
		next(err)
	}
}
