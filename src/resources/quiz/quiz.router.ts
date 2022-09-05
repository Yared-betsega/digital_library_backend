import express from 'express'
import path from 'path'
import { respond } from '../../middlewares/respond'
import { createQuiz, getImage, getSpecificQuiz } from './quiz.controllers'

const quizRouter = express.Router()

quizRouter.use('/image', getImage)
quizRouter.get('/:id', getSpecificQuiz, respond)

export default quizRouter
