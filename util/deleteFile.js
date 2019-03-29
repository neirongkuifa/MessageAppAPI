const fs = require('fs')

module.exports = filePath => {
	fs.unlink(filePath, err => {
		if (err) {
			err.httpStatusCode = 500
			throw err
		}
	})
}
