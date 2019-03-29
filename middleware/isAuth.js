const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
	const token = req.get('authorization')
	let decodedToken
	try {
		decodedToken = jwt.verify(token, 'hardtoguessthissecret')
		if (!decodedToken) {
			const err = new Error('Verification Failed')
			err.httpStatusCode = 401
			throw err
		}
		req.userId = decodedToken.userId
		next()
	} catch (err) {
		if (!err.httpStatusCode) err.httpStatusCode = 500
		next(err)
	}
}
