const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')

const feedRouter = require('./routes/feed')
const authRouter = require('./routes/auth')

// multer Config
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images')
	},
	filename: (req, file, cb) => {
		cb(null, Date.now().toString() + '_' + file.originalname)
	}
})

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/jpeg') {
		cb(null, true)
	} else {
		cb(null, false)
	}
}

// Express Starts
const app = express()

// Middlewares
app.use(bodyParser.json())
app.use(multer({ storage, fileFilter }).single('image'))

// Static files
app.use('/images', express.static('images'))

// CORS Settings
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	next()
})

// Router Entry
app.use('/feed', feedRouter)
app.use(authRouter)

// Error
app.use((err, req, res, next) => {
	console.log(err)
	const status = err.httpStatusCode || 500
	const message = err.message
	res.status(status).json({ message })
})

// Database Config
mongoose
	.connect(
		'mongodb+srv://ch48h2o:@image-shop-brnyc.mongodb.net/Message?retryWrites=true',
		{
			useNewUrlParser: true
		}
	)
	.then(() => {
		console.log('Connected!')
		app.listen(3030)
	})
	.catch(err => {
		console.log(err)
	})
