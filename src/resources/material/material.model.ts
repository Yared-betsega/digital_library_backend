import mongoose, { Schema } from 'mongoose'
import { User } from '../user/user.model'
export interface IMaterialInterface {
  title: String
  thumbnail: String
  department: String
  tags: String
  upvoteCount: number
  description: String
  user: mongoose.Schema.Types.ObjectId
  levelOfEducation: String
  type: String
  typeId: mongoose.Schema.Types.ObjectId
  viewCount: number
  course: string
  year: number
}
export const MaterialSchema = new mongoose.Schema<IMaterialInterface>(
  {
    title: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String
    },
    department: {
      type: String,
      enum: ['SoftwareEngineering', 'ElectricalEngineering'],
      required: true
    },
    tags: {
      type: [String],
      required: false
    },
    upvoteCount: {
      type: Number,
      default: 0
    },
    description: {
      type: String
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    levelOfEducation: {
      type: String,
      enum: ['University', 'Highschool'],
      default: 'University',
      required: true
    },
    type: {
      type: String,
      enum: ['Book', 'Video', 'Notes', 'Quiz'],
      required: true
    },
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'type',
      required: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    course: {
      type: String,
      required: false
    },
    year: {
      type: Number
    }
  },
  {
    timestamps: {
      createdAt: 'dateUploaded',
      updatedAt: 'dateUpdated'
    }
  }
)

export const Material = mongoose.model<IMaterialInterface>(
  'Material',
  MaterialSchema
)
