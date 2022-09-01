import mongoose, { Schema } from 'mongoose'

export interface ICourseInterface {
  year: Number
  courseName: string
  department: string
}

export const CourseSchema = new mongoose.Schema({
  year: Number,
  courseName: String,
  department: {
    type: String,
    enum: ['SoftwareEngineering', 'ElectricalEngineering']
  }
})

export const Course = mongoose.model<ICourseInterface>('Course', CourseSchema)
