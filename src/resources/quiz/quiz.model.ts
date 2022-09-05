import mongoose from 'mongoose'

interface IQuizInterface {
  numberOfQuestions: Number
  instruction: String
  questions: [Object]
  duration: Number
  image64: String
}

const QuizSchema = new mongoose.Schema<IQuizInterface>({
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
      'https://res.cloudinary.com/digitallibrary/image/upload/v1662131485/defaults/quiz_jd3mug.jpg'
  }
})

export const Quiz = mongoose.model('Quiz', QuizSchema)
