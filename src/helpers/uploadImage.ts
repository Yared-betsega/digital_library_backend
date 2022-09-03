import { NextFunction, Request, Response } from 'express'
import cloudinary from '../config/cloudinary'
export const uploadImage = async (file: any) => {
  let cloudinaryImage
  try {
    cloudinaryImage = await cloudinary.uploader.upload(file.path, {
      folder: 'Images',
      use_filename: true
    })
  } catch (error) {
    return {
      statusCode: 400,
      message: 'cannot upload image'
    }
  }
  return {
    statusCode: 200,
    data: cloudinaryImage
  }
}
