import mongoose, { Schema } from 'mongoose'
import { User } from '../user/user.model'
import { Material } from '../material/material.model'
import { Reply } from '../reply/reply.model'

export interface ICommentInterface {
  userId: mongoose.Types.ObjectId
  materialId: mongoose.Types.ObjectId
  content: string
  replies: [mongoose.Types.ObjectId]
  numberOfReplies: number
}

export const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    materialId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Material'
    },
    content: {
      type: String,
      maxLength: 500,
      minLength: 1,
      required: true
    },
    replies: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Reply'
      }
    ],
    numberOfReplies: {
      type: Number,
      default: 0
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
