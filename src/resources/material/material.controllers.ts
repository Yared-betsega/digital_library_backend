import { IMaterialInterface, Material } from './material.model'
import { Request, Response, NextFunction } from 'express'
import _, { toInteger } from 'lodash'
import { Book } from '../book/book.model'
import { User } from '../user/user.model'
import { uploadBook } from '../book/book.controllers'
import { uploadVideo } from '../video/video.controllers'
import { Tag } from '../tag/tag.model'
import mongoose from 'mongoose'
import { Upvote } from '../upvote/upvote.model'
import console from 'console'
import { isUpvoted } from '../../helpers/isUpvoted'
import { URLSearchParams } from 'url'
import { createQuiz } from '../quiz/quiz.controllers'
import { Choice } from '../choice/choice.model'
import { Question } from '../questions/question.model'

export async function getMaterialsByUserId(userId) {
  return await Material.find({ userId: userId })
}

export const fetchMaterialById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id } = res.locals
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.locals.json = {
        statusCode: 400,
        message: 'Invalid ID'
      }
      return next()
    }

    let material1 = await Material.findOneAndUpdate(
      { _id: req.params.id, type: { $ne: 'Quiz' } },
      {
        $inc: { viewCount: 1 }
      }
    )
      .select('-__v')
      .populate([
        {
          path: 'typeId',
          select: ' -__v'
        },
        {
          path: 'user',
          select: 'firstName lastName phoneNumber email photoURL'
        }
      ])
    let material2 = await Material.findOneAndUpdate(
      { _id: req.params.id, type: { $eq: 'Quiz' } },
      {
        $inc: { viewCount: 1 }
      }
    )
      .select('-__v')
      .populate([
        {
          path: 'typeId',
          select: ' -__v',
          populate: {
            path: 'questions',
            model: Question,
            select: '-__v',
            populate: {
              path: 'choices',
              model: Choice,
              select: '-__v'
            }
          }
        },
        {
          path: 'user',
          select: 'firstName lastName phoneNumber email photoURL'
        }
      ])
    const material = material1 || material2
    if (!material) {
      res.locals.json = {
        statusCode: 404,
        message: 'material not found'
      }
      return next()
    }
    if (_id) {
      const x = await Upvote.find({
        materialId: material._id,
        userId: _id
      })
      // console.log(x)
      if (x.length > 0) {
        material.isUpvoted = true
      }
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
      .sort({ postDate: 'desc' })
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
          select: 'firstName lastName phoneNumber email photoURL'
        }
      ])

    const { _id } = res.locals
    let final = null
    if (_id) {
      final = await isUpvoted(materials, _id)
    }
    res.locals.json = {
      statusCode: 200,
      data: {
        materials: final || materials,
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
          select: 'firstName lastName phoneNumber email photoURL'
        }
      ])

    const { _id } = res.locals
    let final = null
    if (_id) {
      final = await isUpvoted(materials, _id)
    }
    res.locals.json = {
      statusCode: 200,
      data: {
        materials: final || materials,
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
  const { _id } = res.locals

  const bookUploadResult = await uploadBook(req.file)
  const { statusCode, data: book } = bookUploadResult
  if (statusCode == 400) {
    res.locals.json = {
      statusCode,
      message: bookUploadResult.message
    }
    return next()
  }
  let bookUrl = book.link
  let spliced = bookUrl.split('.')
  spliced.pop()
  spliced.push('jpg')
  let thumbnailGenerated = spliced.join('.')
  const {
    title,
    year,
    department,
    description,
    levelOfEducation,
    type,
    course
  } = req.body
  try {
    const material = await Material.create({
      title,
      department,
      user: _id,
      year,
      description,
      levelOfEducation,
      type,
      course,
      thumbnail: thumbnailGenerated,
      typeId: book._id
    })
    if (!material) {
      res.locals.json = {
        statusCode: 400,
        message: 'Cannot create material'
      }
      return next()
    }
    const userContribution = await User.findById(_id)
    if (userContribution) {
      userContribution.contributions += 1
      await userContribution.save()
    }
    material.description = description || ''

    res.locals.json = {
      statusCode: 201,
      data: material
    }
    return next()
  } catch (error) {
    console.log(error)
    res.locals.json = {
      statusCode: 400,
      message: error.message
    }
    return next()
  }
}

export const createVideoMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = res.locals
  let user: any
  try {
    user = await User.findById(_id)
    if (!user) {
      res.locals.json = {
        statusCode: 400,
        message: 'User does not exist'
      }
      next()
    }
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: error.message
    }
    next()
  }
  if (!req.body) {
    res.locals.json = {
      statusCode: 400,
      message: 'Please enter a body'
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

  const videoLink: string = video.link as string
  const params = new URLSearchParams(videoLink)
  const videoId: string = params.get('https://www.youtube.com/watch?v')
  const thumbnailGenerated: string = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const {
    title,
    department,
    description,
    levelOfEducation,
    type,
    year,
    course
  } = req.body
  try {
    const material = await Material.create({
      title,
      department,
      user: _id,
      year,
      description,
      levelOfEducation,
      type,
      course,
      thumbnail: thumbnailGenerated,
      typeId: video._id
    })
    if (!material) {
      res.locals.json = {
        statusCode: 400,
        message: 'Cannot create material'
      }
      return next()
    }
    const userContribution = await User.findById(user)
    if (userContribution) {
      userContribution.contributions += 1
      await userContribution.save()
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
      message: error.message
    }
    return next()
  }
}
export const createQuizMaterial = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { _id } = res.locals
  let user: any
  try {
    user = await User.findById(_id)
    if (!user) {
      res.locals.json = {
        statusCode: 400,
        message: 'User does not exist'
      }
      next()
    }
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: error.message
    }
    next()
  }
  if (!req.body.tags || req.body.tags.length == 0) {
    res.locals.json = {
      statusCode: 400,
      message: 'Please enter at least one tag'
    }
    return next()
  }
  const quizCreationResult = await createQuiz(req)
  const { statusCode, data: quiz } = quizCreationResult
  if (statusCode == 400) {
    res.locals.json = {
      statusCode,
      message: quizCreationResult.message
    }
    return next()
  }

  const {
    title,
    year,
    department,
    description,
    levelOfEducation,
    type,
    course
  } = req.body
  try {
    const material = await Material.create({
      title,
      department,
      user: _id,
      year,
      description,
      levelOfEducation,
      type,
      course,
      typeId: quiz._id
    })
    if (!material) {
      res.locals.json = {
        statusCode: 400,
        message: 'Cannot create material'
      }
      return next()
    }
    const userContribution = await User.findById(user)
    if (userContribution) {
      userContribution.contributions += 1
      await userContribution.save()
    }

    material.description = description || ''

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
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    let year: number
    let educationFieldOfStudy: String
    let type: String

    if (req.query.department)
      educationFieldOfStudy = req.query.department.toString()

    if (req.query.type) type = req.query.type.toString()

    if (req.query.year) year = Number(req.query.year)

    const finder = {
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

    const materials = await Material.find(finder)
      .sort({ postDate: 'desc' })
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
          select: 'firstName lastName phoneNumber email photoURL'
        }
      ])

    let filtered = []
    if (req.query.course) {
      let course = req.query.course as [string]
      if (typeof course === typeof '') {
        course = [course as unknown as string]
      }

      const courseNames = new Set([...course])
      console.log(courseNames)

      for (let material of materials) {
        if (courseNames.has(material.course)) {
          filtered.push(material)
        }
      }
      const response = paginator(filtered, skip, limit)
      res.locals.json = {
        statusCode: 200,
        data: {
          materials: response.data,
          hasNext: Math.ceil(response.total / limit) >= skip + 1
        }
      }
      return next()
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
    const keyword = req.query.keyword || ''
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    const estimate = await Material.find({
      title: { $regex: `${keyword}`, $options: 'i' }
    }).count()
    const materials = await Material.find({
      title: { $regex: `${keyword}`, $options: 'i' }
    })
      .sort({ dateUploaded: 'desc' })
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
          select: 'firstName lastName phoneNumber email photoURL'
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
  try {
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
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: 'filter by each year failed'
    }
  }
}

export const resetUpvote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const materials = await Material.updateMany({}, { upvoteCount: 0 })
  const user = await User.updateMany({}, { upVotes: [] })
  return res.status(200).json({ user })
}
export const searchCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { keyword } = req.query
  let materials
  if (!keyword) {
    materials = await Material.find({})
  } else {
    materials = await Material.find({
      course: { $regex: `${keyword}`, $options: 'i' }
    })
  }
  let response = new Set()
  for (let material of materials) {
    if (material.course != null) {
      response.add(material.course)
    }
  }
  console.log(response)
  res.locals.json = {
    statusCode: 200,
    data: [...response]
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
