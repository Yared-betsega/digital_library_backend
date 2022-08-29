import mongoose from 'mongoose'
import { Upvote } from './upvote.model'

export async function getUpvoteCountByMaterialId(
  materialId: mongoose.Types.ObjectId
) {
  const upvotes = await Upvote.countDocuments({ materialId: materialId })
  return upvotes
}
