import { IMaterialInterface, Material } from './material.model'
import { Request, Response, NextFunction } from 'express'
import _, { toInteger } from 'lodash'
import { Book } from '../book/book.model'
import { setUp } from '../../utils/db/connect'
import { User } from '../user/user.model'
import { uploadBook } from '../book/book.controllers'
import { uploadVideo } from '../video/video.controllers'
import { isValidObjectId } from 'mongoose'
import { Tag } from '../tag/tag.model'
import mongoose from 'mongoose'
export async function getMaterialsByUserId(userId) {
  return await Material.find({ userId: userId })
}

export const fetchMaterialById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
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
  try {
    const limit = toInteger(req.query.limit) || 10
    const skip = toInteger(req.query.skip) || 1

    let year: number
    let educationFieldOfStudy: String
    let levelOfEducation: String
    let type: String

    if (req.query.department)
      educationFieldOfStudy = req.query.department.toString()

    if (req.query.levelOfEducation)
      levelOfEducation = req.query.levelOfEducation.toString()

    if (req.query.type) type = req.query.type.toString()

    if (req.query.year) year = Number(req.query.year)

    const finder = {
      levelOfEducation: levelOfEducation || {
        $ne: null
      },
      department: educationFieldOfStudy || {
        $ne: null
      },
      type: type || {
        $ne: null
      },
      year: year || {
        $ne: null
      }
    }

    const estimate = await Material.find(finder).count()
    const materials = await Material.find(finder)
      .skip((skip - 1) * limit)
      .limit(limit)
      .select('-__v')
      .populate([
        {
          path: 'typeId',
          select: '-__v'
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
  } catch (error) {
    console.log(error)
    res.locals.json = {
      statusCode: 400,
      message: "couldn't fetch recommendation"
    }
    return next()
  }
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
export const createBookMaterial = async (
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
    material.description = description || ''
    let { tags } = req.body
    if (typeof tags !== typeof []) {
      tags = [tags]
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

export const createVideoMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body)
  if (!req.body) {
    res.locals.json = {
      statusCode: 400,
      message: 'Please enter a body'
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
  const videoUploadResult = await uploadVideo(req.body.link)
  const { statusCode, data: video } = videoUploadResult
  if (statusCode == 400) {
    res.locals.json = {
      statusCode,
      message: videoUploadResult.message
    }
    return next()
  }
  const {
    title,
    thumbnail,
    department,
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
      typeId: video._id
    })
    if (!material) {
      res.locals.json = {
        statusCode: 400,
        message: 'Cannot create material'
      }
      return next()
    }
    let { tags } = req.body
    if (typeof tags !== typeof []) {
      tags = [tags]
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
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    let materials = []
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
    if (materials.length == 0) {
      materials = await Material.find({})
    }
    const response = paginator(materials, skip, limit)
    res.locals.json = {
      statusCode: 200,
      data: {
        materials: response.data,
        hasNext: Math.ceil(response.total / limit) >= skip + 1
      }
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

export async function popularByType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    const type: string = req.query.type.toString()
    // const types = new Map([['Book', Book],['Video', Video],['Quiz', Quiz]]) for future purpopses when the models are implemented
    const types = new Map([['Book', Book]])
    const estimate = await types.get(type).estimatedDocumentCount()
    const materials = await types
      .get(type)
      .find()
      .skip((skip - 1) * limit)
      .limit(limit)
      .select('-__v')
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
export const filterByEachYear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { department } = req.query
  const materialsByEachYear = {}
  for (let i = 1; i <= 5; i++) {
    materialsByEachYear[i] = []
    const tag = await Tag.findOne({ name: i }).populate('materials')
    if (tag) {
      tag.materials.forEach((material: IMaterialInterface) => {
        if (material.department === department.toString()) {
          materialsByEachYear[i].push(material)
        }
      })
    }
  }
  res.locals.json = {
    statusCode: 200,
    data: materialsByEachYear
  }
  return next()
}

function paginator(items, current_page, per_page) {
  let offset = (current_page - 1) * per_page,
    paginatedItems = items.slice(offset).slice(0, per_page),
    total_pages = Math.ceil(items.length / per_page)

  return {
    pre_page: current_page - 1 ? current_page - 1 : null,
    next_page: total_pages > current_page ? current_page + 1 : null,
    total: items.length,
    total_pages: total_pages,
    data: paginatedItems
  }
}
