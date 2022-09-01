import { NextFunction, Request } from 'express'
import { Video } from './video.model'

export const uploadVideo = async (link: String) => {
  if (!link) {
    return {
      statusCode: 400,
      message: 'please upload video link'
    }
  }
  try {
    const video = await Video.create({
      link: link
    })
    return {
      statusCode: 200,
      data: video
    }
  } catch (error) {
    return {
      statusCode: 400,
      message: error
    }
  }
}
