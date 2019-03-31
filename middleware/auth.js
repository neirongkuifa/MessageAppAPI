const jwt = require('jsonwebtoken')

// We need to ensure the part that does not need authorization is still accessable

module.exports = (req, res, next) => {
	const token = req.get('authorization')
	if (!token) {
		req.isAuth = false
		return next()
	}
	try {
		const decodedToken = jwt.verify(
			token,
			'thisstringshouldbeaslongaspossibles'
		)
		if (!decodedToken) {
			req.isAuth = false
			return next()
		}
		req.userId = decodedToken.userId
		req.isAuth = true
		next()
	} catch (err) {
		req.isAuth = false
		next()
	}
}
