import mongoose, { Schema } from 'mongoose'
import { Material } from './../material/material.model'

export interface IUserInterface {
  email: String
  phoneNumber: String
  password: String
  isVerified: Boolean
  firstName: String
  middleName: String
  lastName: String
  birthDate: Date
  bio: String
  contributions: number
  upVotes: [mongoose.Types.ObjectId]
  // material is to be imported
  photoURL: String
  educationPlace: String
  educationFieldOfStudy: String
  levelOfEducation: String
  year: number
}

const userSchema: Schema<IUserInterface> = new mongoose.Schema({
  email: {
    type: String
  },

  phoneNumber: {
    type: String
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  firstName: {
    type: String,
    Required: true
  },

  middleName: {
    type: String,
    Required: false
  },

  lastName: {
    type: String,
    Required: true
  },

  birthDate: {
    type: Date,
    Required: false
  },

  bio: {
    type: String,
    Required: false
  },

  contributions: {
    type: Number,
    default: 0
  },

  upVotes: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Upvote'
    }
  ],

  photoURL: {
    type: String,
    default:
      'https://res.cloudinary.com/digitallibrary/image/upload/v1662131476/defaults/profile_qrezuo.jpg',
    Required: false
  },

  educationPlace: {
    type: String,
    Required: false
  },

  educationFieldOfStudy: {
    type: String,
    enum: ['SoftwareEngineering', 'ElectricalEngineering']
  },

  levelOfEducation: {
    type: String,
    enum: ['HighSchool', 'University']
  },
  year: {
    type: Number
  }
})

export const User = mongoose.model<IUserInterface>('User', userSchema)
