import { NextFunction, Request, Response } from 'express'
import { Book } from './book.model'
import cloudinary from '../../config/cloudinary'
export const uploadBook = async (file: any) => {
  let cloudinaryImage
  try {
    cloudinaryImage = await cloudinary.uploader.upload(file.path, {
      folder: 'Books'
    })
  } catch (error) {
    return {
      statusCode: 400,
      message: 'cannot upload book'
    }
  }

  const book = await Book.create({
    link: cloudinaryImage.secure_url
  })
  if (!book) {
    return {
      statusCode: 400,
      message: 'cannot upload book'
    }
  }
  return {
    statusCode: 201,
    data: book
  }
}
