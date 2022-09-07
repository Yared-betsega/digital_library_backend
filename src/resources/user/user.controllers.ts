import { Request, Response, NextFunction } from 'express'
import { User, IUserInterface } from './user.model'
import JWT from 'jsonwebtoken'
import { OTP } from '../OTP/otp.model'
import { generateToken } from '../../helpers/generateToken'
import { v4 as uuidv4 } from 'uuid'
import { userInfo } from 'os'
import _, { range, toInteger } from 'lodash'

import { getMaterialsByUserId } from '../material/material.controllers'
import { getUpvoteCountByMaterialId } from '../upvote/upvoteControllers'
import { Material } from '../material/material.model'
import materialRouter from '../material/material.router'
import { Upvote } from '../upvote/upvote.model'
import { uploadImage } from '../../helpers/uploadImage'
import { isUpvoted } from '../../helpers/isUpvoted'
export const fetchAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await User.find({})
  res.locals.json = {
    statusCode: 200,
    data: users
  }
  return next()
}

export const fetchUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = res.locals

  const user = await User.findById(_id)

  if (!user) {
    res.locals.json = {
      statusCode: 400,
      message: 'user not found'
    }
    return next()
  }

  res.locals.json = {
    statusCode: 200,
    data: _.pick(user, [
      '_id',
      'email',
      'firstName',
      'middleName',
      'lastName',
      'phoneNumber',
      'bio',
      'birthDate',
      'photoURL',
      'educationPlace',
      'educationFieldOfStudy',
      'year'
    ])
  }
  return next()
}
export const fetchUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.params
  const user = await User.findOne({ email })
  if (!user) {
    res.locals.json = {
      statusCode: 404,
      message: "A user with the given email doesn't exist"
    }
    return next()
  }
  res.locals.json = {
    statusCode: 200,
    data: user
  }
  return next()
}

export const updateUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id } = res.locals

    if (req.body.email || req.body.password || req.body.phoneNumber) {
      res.locals.json = {
        statusCode: 403,
        message: 'Forbidden action'
      }
      return next()
    }
    if (
      req.body.department &&
      req.body.department !== 'SoftwareEngineering' &&
      req.body.department !== 'ElectricalEngineering'
    ) {
      res.locals.json = {
        statusCode: 400,
        message:
          'Field should be a valid type of enum [SoftwareEngineering, ElectricalEngineering]'
      }
      return next()
    }
    let user = await User.findByIdAndUpdate(_id, {
      $set: req.body
    })
    if (req.file) {
      const result = await uploadImage(req.file)
      if (result) {
        user.photoURL = result.data.secure_url
      }
    }
    await user.save()

    const updatedUser = await User.findById(_id).select('-__v -password')

    res.locals.json = {
      statusCode: 200,
      data: updatedUser
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 500,
      message: error.message
    }
    return next()
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.params
  const user = await User.deleteOne({ email })
  if (!user) {
    res.locals.json = {
      statusCode: 400,
      message: 'Cannot remove account'
    }
    return next()
  }

  const otp = await OTP.deleteOne({ email })
  res.locals.json = {
    statusCode: 200,
    message: 'Account successfully deleted'
  }
  return next()
}

export const deleteAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await User.deleteMany({})
    await OTP.deleteMany({})
    console.log('del')
    res.locals.json = {
      statusCode: 200,
      message: 'All accounts deleted'
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: 'Cannot delete all accounts'
    }
    return next()
  }
}

export const topContributors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({}).sort({ contributions: -1 })

    const materials = []

    for (let index = 0; index < 10; index++) {
      let m = await getMaterialsByUserId(users[index]._id)
      materials.push(m)
    }

    const upVotes = []
    for (let i = 0; i < materials.length; i++) {
      let upvote = 0
      for (let index = 0; index < materials[i].length; index++) {
        upvote += await getUpvoteCountByMaterialId(materials[i][index]._id)
      }
      upVotes.push(upvote)
    }
    const Users = []
    for (let index = 0; index < 10; index++) {
      let userObj = {
        firstName: users[index].firstName,
        lastName: users[index].lastName,
        middleName: users[index].middleName,
        email: users[index].email,
        contributions: users[index].contributions,
        photoURL: users[index].photoURL,
        upVotes: upVotes[index]
      }

      Users.push(userObj)
    }

    res.locals.json = {
      statusCode: 200,
      data: Users
    }

    return next()
  } catch (e) {
    res.locals.json = {
      statusCode: 400,
      message: 'Cannot retrieve users'
    }
    return next()
  }
}
export const myFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    const { _id } = res.locals

    const temp = await User.find({ _id: _id }).select('upVotes')
    const estimate = Object.keys(temp[0].upVotes).length
    const user = await User.find({ _id: _id })
      .select('upVotes')
      .populate([
        {
          path: 'upVotes',
          select: ' -__v',
          options: {
            limit: limit,
            skip: (skip - 1) * limit
          },
          model: Upvote,
          populate: {
            path: 'materialId',
            select: ' -__v',
            populate: [
              {
                path: 'typeId',
                select: ' -__v'
              },
              {
                path: 'user',
                select: 'firstName lastName photoURL'
              }
            ]
          }
        }
      ])
    res.locals.json = {
      statusCode: 200,
      data: user,
      hasNext: Math.ceil(estimate / limit) >= skip + 1
    }
    return next()
  } catch (err) {
    res.locals.json = {
      statusCode: 400,
      data: "problem occured fetching user's favorites"
    }
    return next()
  }
}

export const myMaterials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    let type: string
    if (req.query.type) type = req.query.type.toString()

    const estimate: number = await Material.find({
      user: id,
      type: type || { $ne: null }
    }).count()

    const uploaded = await Material.find({
      user: id,
      type: type || { $ne: null }
    })
      .populate({ path: 'user' })
      .populate({ path: 'typeId' })
      .skip((skip - 1) * limit)
      .limit(limit)
      .select('-__v')

    let final = null
    if (id) {
      final = await isUpvoted(uploaded, id)
    }
    res.locals.json = {
      statusCode: 200,
      data: {
        materials: final || uploaded,
        hasNext: Math.ceil(estimate / limit) >= skip + 1
      }
    }
    return next()
  } catch (error) {
    console.log(error)
    res.locals.json = {
      statusCode: 400,
      data: "problem occured fetching user's materials"
    }
    return next()
  }
}

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params

  try {
    const user = await User.findById(userId)

    if (!user) {
      res.locals.json = {
        statusCode: 400,
        message: 'user not found'
      }
      return next()
    }

    res.locals.json = {
      statusCode: 200,
      data: _.pick(user, [
        '_id',
        'email',
        'firstName',
        'middleName',
        'lastName',
        'phoneNumber',
        'bio',
        'birthDate',
        'photoURL',
        'educationPlace',
        'educationFieldOfStudy',
        'year'
      ])
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
