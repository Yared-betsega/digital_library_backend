import { Material } from './material.model'
import { Request, Response, NextFunction } from 'express'
import _, { toInteger } from 'lodash'
import { Book } from '../book/book.model'
import { setUp } from '../../utils/db/connect'
import { User } from '../user/user.model'
import { uploadBook } from '../book/book.controllers'
import { isValidObjectId } from 'mongoose'
import { Tag } from '../tag/tag.model'
export async function getMaterialsByUserId(userId) {
  return await Material.find({ userId: userId })
}

export const fetchMaterialById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.locals.json = {
        statusCode: 400,
        message: 'Invalid ID'
      }
      return next()
    }

    const material = await Material.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 }
    })
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
    if (!material) {
      res.locals.json = {
        statusCode: 404,
        message: 'material not found'
      }
      return next()
    }
    res.locals.json = {
      statusCode: 200,
      data: {
        materials: material
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
  if (!req.body.tags || req.body.tags.length == 0) {
    res.locals.json = {
      statusCode: 400,
      message: 'Please enter at least one tag'
    }
    return next()
  }
  const bookUploadResult = await uploadBook(req.file)
  const { statusCode, data: book } = bookUploadResult
  if (statusCode == 400) {
    res.locals.json = {
      statusCode,
      message: bookUploadResult.message
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
    tags.forEach(async (tagName) => {
      let tag = await Tag.findOne({ name: tagName })
      if (!tag) {
        tag = await Tag.create({
          name: tagName
        })
      }
      tag.materials.push(material._id)
      await tag.save()
    })

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

export const filter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tags = res.locals.tags
    const materials = []
    const added = new Set()
    for (var key in tags) {
      const tag = await Tag.findOne({ name: tags[key] }).populate('materials')
      if (tag) {
        tag.materials.forEach((material: any) => {
          if (!added.has(material._id.toString())) {
            added.add(material._id.toString())
            materials.push(material)
          }
        })
      }
    }
    res.locals.json = {
      statusCode: 200,
      data: materials
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: 'filtering failed'
    }
    return next()
  }
}

export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const keyword = req.query.keyword
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    const estimate = await Material.estimatedDocumentCount()
    const materials = await Material.find({ title: { $regex: `${keyword}` } })
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
    res.locals.json = {
      statusCode: 200,
      data: {
        materials: materials,
        hasNext: Math.ceil(estimate / limit) >= skip + 1
      }
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: 'Internal server error'
    }
  }
}

export const filterByEachYear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const materialsByEachYear = {}
  for (let i = 1; i <= 5; i++) {
    const tag = await Tag.findOne({ name: i }).populate('materials')
    if (!tag) {
      materialsByEachYear[i] = []
    } else {
      materialsByEachYear[i] = tag.materials
    }
  }
  res.locals.json = {
    statusCode: 200,
    data: materialsByEachYear
  }
  return next()
}
