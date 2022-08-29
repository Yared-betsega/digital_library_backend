import mongoose, { Schema } from 'mongoose'

export interface IUpvoteInterface {
  userId: mongoose.Schema.Types.ObjectId
  materialId: mongoose.Schema.Types.ObjectId
}

const UpvoteSchema: Schema<IUpvoteInterface> = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

export const Upvote = mongoose.model<IUpvoteInterface>('Upvote', UpvoteSchema)
