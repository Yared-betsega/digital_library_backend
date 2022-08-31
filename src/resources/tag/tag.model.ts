import mongoose from 'mongoose'
import { MaterialSchema } from '../material/material.model'

export interface ITagInterface {
  name: String
  materials: [Object]
}

export const TagSchema = new mongoose.Schema<ITagInterface>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  materials: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Material'
    }
  ]
})

export const Tag = mongoose.model<ITagInterface>('Tag', TagSchema)
