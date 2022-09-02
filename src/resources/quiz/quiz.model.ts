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
    type: String
  }
})

export const Quiz = mongoose.model('Quiz', QuizSchema)
