import express from 'express'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.routes.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(cookieParser())

app.get('/health', (req, res) => {
  res.send({ status: 'ok' })
})

// User Routes
app.use('/', userRouter)

export default app
