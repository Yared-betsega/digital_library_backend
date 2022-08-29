import { Material } from './material.model'
import { Request, Response, NextFunction } from 'express'
import _, { toInteger } from 'lodash'
import { Book } from '../book/book.model'
import { setUp } from '../../utils/db/connect'
import { User } from '../user/user.model'
import { uploadBook } from '../book/book.controllers'
export async function getMaterialsByUserId(userId) {
  return await Material.find({ userId: userId })
}
export const recommend = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = res.locals
  let materials = []
  let remains = []
  let educationFieldOfStudy
  let levelOfEducation

  let limit = toInteger(req.query.limit) || 10
  let skip = toInteger(req.query.skip) || 1
  const estimate = await Material.estimatedDocumentCount()

  const user = await User.findById(_id)
  if (user) {
    educationFieldOfStudy = user.educationFieldOfStudy
    levelOfEducation = user.levelOfEducation

    if (educationFieldOfStudy && levelOfEducation) {
      materials = await Material.find({
        levelOfEducation: levelOfEducation,
        department: educationFieldOfStudy
      })
        .skip((skip - 1) * limit)
        .limit(limit)
    }
    if (educationFieldOfStudy && materials.length < limit) {
      remains = await Material.find({
        department: educationFieldOfStudy
      })
        .skip((skip - 1) * limit)
        .limit(limit - materials.length)
      materials = materials.concat(remains)
    }
    if (levelOfEducation && materials.length < limit) {
      remains = await Material.find({
        levelOfEducation: levelOfEducation
      })
        .skip((skip - 1) * limit)
        .limit(limit - materials.length)
      materials = materials.concat(remains)
    }
  }
  if (materials.length < limit) {
    const remains = await Material.find()
      .skip((skip - 1) * limit)
      .limit(limit - materials.length)
    materials = materials.concat(remains)
  }
  res.locals.json = {
    statusCode: 200,
    data: {
      materials: materials,
      hasNext: Math.ceil(estimate / limit) >= skip + 1
    }
  }
  return next()
}

export async function popular(req: Request, res: Response, next: NextFunction) {
  try {
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    const estimate = await Material.estimatedDocumentCount()
    const materials = await Material.find()
      .sort({ upvoteCount: -1 })
      .skip((skip - 1) * limit)
      .limit(limit)
      .select('-__v')
      .populate([
        {
          path: 'typeId',
          select: ' -__v'
        },
        {
          path: 'user',
          select: 'firstName lastName phoneNumber email '
        }
      ])
    if (Object.keys(materials).length === 0) {
      res.locals.json = {
        statusCode: 400,
        message: 'no data found'
      }
      return next()
    }
    res.locals.json = {
      statusCode: 200,
      data: {
        materials: materials,
        hasNext: Math.ceil(estimate / limit) >= skip + 1
      }
    }
    return next()
  } catch (err) {
    console.log(err)
    res.locals.json = {
      statusCode: 500,
      message: 'Server failed'
    }
    return next()
  }
}
export const createMaterial = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    res.locals.json = {
      statusCode: 400,
      message: 'Please upload book'
    }
    return next()
  }
  const bookUploadResult = await uploadBook(req.file)
  const { statusCode, data: book } = bookUploadResult
  if (statusCode == 400) {
    res.locals.json = {
      statusCode,
      message: 'cannot upload book'
    }
    return next()
  }
  const {
    title,
    thumbnail,
    department,
    tags,
    user,
    description,
    levelOfEducation,
    type,
    course
  } = req.body
  try {
    const material = await Material.create({
      title,
      thumbnail,
      department,
      tags,
      user,
      description,
      levelOfEducation,
      type,
      course,
      typeId: book._id
    })
    if (!material) {
      res.locals.json = {
        statusCode: 400,
        message: 'Cannot create material'
      }
      return next()
    }
    res.locals.json = {
      statusCode: 201,
      data: material
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: error
    }
    return next()
  }
}
