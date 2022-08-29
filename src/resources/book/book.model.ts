import mongoose from 'mongoose'

export interface IBookInterface {
  description: String
  link: String
}
export const bookSchema: mongoose.Schema<IBookInterface> = new mongoose.Schema({
  link: {
    type: String,
    required: true
  }
})
export const Book = mongoose.model<IBookInterface>('Book', bookSchema)
