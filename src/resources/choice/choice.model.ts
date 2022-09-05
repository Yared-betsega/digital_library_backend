import mongoose from 'mongoose'

interface IChoiceInterface {
  index: Number
  text: String
  image64: String
}

const ChoiceSchema = new mongoose.Schema<IChoiceInterface>({
  index: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  image64: {
    type: String
  }
})

export const Choice = mongoose.model('Choice', ChoiceSchema)
