const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const graphqlHttp = require('express-graphql')

const gqSchema = require('./graphql/schema')
const gqResolver = require('./graphql/resolvers')

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
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET,POST,PUT,DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	next()
})

app.use(
	'/graphql',
	graphqlHttp({
		schema: gqSchema,
		rootValue: gqResolver,
		graphiql: true,
		formatError(err) {
			if (!err.originalError) {
				return err
			}
			const data = err.originalError.data
			const message = err.message || 'An Error Occured'
			const status = err.originalError.code || 500
			return { message, status, data }
		}
	})
)

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
		'mongodb+srv://ch48h2o:test123imageshop@image-shop-brnyc.mongodb.net/Message?retryWrites=true',
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
