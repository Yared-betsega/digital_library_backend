import mongoose from 'mongoose'

interface IQuestionInterface {
  text: String
  index: Number
  choices: [Object]
  answerIndex: Number
  image64: String
  explanation: String
}

const QuestionSchema = new mongoose.Schema<IQuestionInterface>({
  text: {
    type: String
  },
  index: {
    type: Number,
    required: true
  },
  choices: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Choice'
    }
  ],
  answerIndex: {
    type: Number
  },
  image64: {
    type: String
<<<<<<< HEAD
  },
  explanation: {
    type: String
=======
>>>>>>> 130c2dc8aa4981a930437d5be1453bf989cfa3f6
  }
})

export const Question = mongoose.model('Question', QuestionSchema)
