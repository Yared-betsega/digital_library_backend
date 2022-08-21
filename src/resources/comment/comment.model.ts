import mongoose, { Schema } from 'mongoose'

export interface ICommentInterface {
  userId: mongoose.Types.ObjectId
  materialId: mongoose.Types.ObjectId
  content: string
}

export const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    materialId: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    content: {
      type: String,
      maxLength: 500,
      minLength: 1,
      required: true
    }
  },

  {
    timestamps: {
      createdAt: 'postDate',
      updatedAt: 'updateDate'
    }
  }
)

export const Comment = mongoose.model<ICommentInterface>(
  'Comment',
  CommentSchema
)
