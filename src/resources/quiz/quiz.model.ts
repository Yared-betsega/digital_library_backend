import mongoose from 'mongoose'

interface IQuizInterface {
  quizName: String
  numberOfQuestions: Number
  instruction: String
  questions: [Object]
  duration: Number
  image64: String
}

const QuizSchema = new mongoose.Schema<IQuizInterface>({
  quizName: {
    type: String,
    required: true
  },
  numberOfQuestions: {
    type: Number,
    required: true
  },
  instruction: {
    type: String
  },
  questions: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Question'
    }
  ],
  duration: {
    type: Number,
    required: true
  },
  image64: {
    type: String,
    default:
      'https://res.cloudinary.com/digitallibrary/image/upload/v1662630404/defaults/quiz_azfic3.png'
  }
})

export const Quiz = mongoose.model('Quiz', QuizSchema)
