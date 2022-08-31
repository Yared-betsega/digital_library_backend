import mongoose from 'mongoose'

export interface IReplyInterface {
  userId: mongoose.Schema.Types.ObjectId
  commentId: mongoose.Schema.Types.ObjectId
  content: String
}
export const ReplySchema = new mongoose.Schema<IReplyInterface>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Comment'
    },
    content: {
      type: String,
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
export const Reply = mongoose.model<IReplyInterface>('Reply', ReplySchema)
