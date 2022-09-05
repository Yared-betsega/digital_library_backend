import express from 'express'
import bodyParser from 'body-parser'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import config from './config'
import cors from 'cors'
import { connect } from './utils/db/setupDB'
import authRouter from './utils/auth/auth.router'
import userRouter from './resources/user/user.router'
import materialRouter from './resources/material/material.router'
import { replyRouter } from './resources/reply/reply.router'
import commentRouter from './resources/comment/comment.router'
import courseRouter from './resources/course/course.router'
import quizRouter from './resources/quiz/quiz.router'
import { upvoteRouter } from './resources/upvote/upvote.router'

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))

app.use(urlencoded({ extended: true, limit: '50mb' }))
app.use(morgan('dev'))

// app.use('/', (req, res) => {
//   res.json({ data: 'Hello World!' })
// })
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/material', materialRouter)
app.use('/api/v1/comment', commentRouter)
app.use('/api/v1/reply', replyRouter)
app.use('/api/v1/course', courseRouter)
app.use('/api/v1/quiz', quizRouter)
app.use('/api/v1/upvote', upvoteRouter)
app.use((req, res) => {
  res.json({ data: 'Hello World!' })
})

export const start = async () => {
  try {
    await connect()
    app.listen(config.port, () => {
      console.log(`REST API on http://${config.host}:${config.port}/api`)
    })
  } catch (e) {
    console.error(e)
  }
}
