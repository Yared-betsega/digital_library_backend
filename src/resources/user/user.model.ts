import mongoose, { Schema } from 'mongoose'

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
  photoURL: String
  educationPlace: String
  educationFieldOfStudy: String
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

  photoURL: {
    type: String,
    Required: false
  },

  educationPlace: {
    type: String,
    Required: false
  },

  educationFieldOfStudy: {
    type: String,
    Required: false
  }
})

export const User = mongoose.model<IUserInterface>('User', userSchema)
