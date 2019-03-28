exports.getPosts = (req, res, next) => {
	const posts = {
		posts: [{ title: 'First Post', content: 'This is the first post' }]
	}
	res.status(200).json(posts)
}

exports.postPost = (req, res, next) => {
	const title = req.body.title
	const content = req.body.content
	res.status(201).json({
		message: 'Post Created Successfully',
		post: {
			id: Date.now().toString(),
			title,
			content
		}
	})
}
