import mongoose, { Schema } from 'mongoose'

export interface IMaterialInterface {
  levelOfEducation: String
  materialType: String
  typeId: mongoose.Schema.Types.ObjectId
  viewCount: number
  course: string
}
export const MaterialSchema = new mongoose.Schema<IMaterialInterface>(
  {
    levelOfEducation: {
      type: String,
      enum: ['University', 'Highschool'],
      required: true
    },
    materialType: {
      type: String,
      enum: ['Book', 'Video', 'Notes', 'Quiz'],
      required: true
    },
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    viewCount: {
      type: Number,
      required: true
    },

    course: {
      type: String,
      required: true
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
