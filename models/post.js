const mongoose = require('mongoose')

const Schema = mongoose.Schema
const Model = mongoose.model

const postSchema = new Schema(
	{
		title: {
			type: String,
			required: true
		},
		imgUrl: {
			type: String,
			required: true
		},
		content: {
			type: String,
			required: true
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{ timestamps: true }
)

module.exports = Model('Post', postSchema)
