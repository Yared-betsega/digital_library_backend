import mongoose from 'mongoose'

export interface IVideoInterface {
  link: String
}
export const videoSchema: mongoose.Schema<IVideoInterface> =
  new mongoose.Schema({
    link: {
      type: String,
      required: true
    }
  })
export const Video = mongoose.model<IVideoInterface>('Video', videoSchema)
