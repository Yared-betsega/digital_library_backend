import { NextFunction, Request, Response } from 'express'
import { Choice } from '../choice/choice.model'
import { Question } from '../questions/question.model'
import { Quiz } from './quiz.model'
import fs from 'fs'
import path from 'path'
import mime from 'mime'

export const getSpecificQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const quiz = await Quiz.findById(id).populate({
      path: 'questions',
      model: 'Question',
      populate: {
        path: 'choices',
        model: 'Choice'
      }
    })
    if (!quiz) {
      res.locals.json = {
        statusCode: 404,
        message: 'Quiz with the given ID not found'
      }
      return next()
    }
    res.locals.json = {
      statusCode: 200,
      data: quiz
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: 'Cannot find Quiz'
    }
    return next()
  }
}
export const createQuiz = async (req: Request) => {
  try {
    const {
      duration,
      numberOfQuestions,
      instruction,
      questions,
      image64: quizImage
    } = req.body
    if (!duration || !numberOfQuestions) {
      return {
        statusCode: 400,
        message: 'Please enter all required fields'
      }
    }
    if (questions.length === 0) {
      return {
        statusCode: 400,
        message: 'Please enter at least one question'
      }
    }
    let createdQuestions = []
    for (let question of questions) {
      const {
        text,
        answerIndex,
        index: questionIndex,
        choices,
        explanation,
        image64: questionImage
      } = question
      if (text === null || answerIndex === null) {
        return {
          statusCode: 400,
          message: `please enter text and answerIndex for question ${questionIndex}`
        }
      }
      if (choices.length === 0) {
        return {
          statucCode: 400,
          message: `Please enter choices for question number ${questionIndex}`
        }
      }
      let createdChoices = []
      for (let choice of choices) {
        const { index: choiceIndex, text, image64: choiceImage } = choice
        if (choiceIndex === null || text === null) {
          return {
            statusCode: 400,
            message: `Please enter index and text for choice ${choiceIndex} of question ${questionIndex}`
          }
        }
        let choiceFilePath
        if (choiceImage) {
          const parts = choiceImage.split(',')
          const left = parts[0].split(';')[0]
          const extension = left.split('/')[1]
          choiceFilePath = `/choiceImages/${Date.now()}_${choiceIndex}.${extension}`
          let choiceBuffer = Buffer.from(parts[1], 'base64')
          fs.writeFileSync(path.join(__dirname, choiceFilePath), choiceBuffer)
        }
        const choiceCreated = await Choice.create({
          index: choiceIndex,
          text: text,
          image64: choiceFilePath
        })
        createdChoices.push(choiceCreated._id)
      }
      let questionFilePath
      if (questionImage) {
        const parts = questionImage.split(',')
        const left = parts[0].split(';')[0]
        const extension = left.split('/')[1]
        questionFilePath = `/questionImages/${Date.now()}_${questionIndex}.${extension}`
        let questionBuffer = Buffer.from(parts[1], 'base64')
        fs.writeFileSync(path.join(__dirname, questionFilePath), questionBuffer)
      }
      const questionCreated = await Question.create({
        text: text,
        answerIndex: answerIndex,
        index: questionIndex,
        choices: createdChoices,
        explanation: explanation,
        image64: questionFilePath
      })
      createdQuestions.push(questionCreated._id)
    }
    let quizFilePath
    if (quizImage) {
      const parts = quizImage.split(',')
      const left = parts[0].split(';')[0]
      const extension = left.split('/')[1]
      quizFilePath = `/quizImages/${Date.now()}.${extension}`
      let quizBuffer = Buffer.from(parts[1], 'base64')
      fs.writeFileSync(path.join(__dirname, quizFilePath), quizBuffer)
    }
    const quizCreated = await Quiz.create({
      duration: duration,
      numberOfQuestions: numberOfQuestions,
      instruction: instruction,
      questions: createdQuestions,
      image64: quizFilePath
    })
    return {
      statusCode: 201,
      data: await quizCreated.populate({
        path: 'questions',
        model: 'Question',
        populate: {
          path: 'choices',
          model: 'Choice'
        }
      })
    }
  } catch (error) {
    return {
      statusCode: 400,
      message: error
    }
  }
}
export const updateQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {}

export const deleteQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {}

export const getImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body || !req.body.url) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Please enter image url'
    })
  }
  res.sendFile(path.join(__dirname, req.body.url))
}
