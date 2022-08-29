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

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(bodyParser.json())

app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

// app.use('/', (req, res) => {
//   res.json({ data: 'Hello World!' })
// })
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/material', materialRouter)
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
