import { Request, Response, NextFunction } from 'express'
import { User, IUserInterface } from './user.model'
import JWT from 'jsonwebtoken'
import { OTP } from '../OTP/otp.model'
import { generateToken } from '../../helpers/generateToken'
import { v4 as uuidv4 } from 'uuid'
import { userInfo } from 'os'
import _, { range } from 'lodash'

import { getMaterialsByUserId } from '../material/material.controllers'
import { getUpvoteCountByMaterialId } from '../upvote/upvoteControllers'
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
      'educationFieldOfStudy'
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.params.id !== res.locals.payload._id) {
    console.log(res.locals)
    res.locals.json = {
      statusCode: 403,
      message: 'You are not authorized to edit this account'
    }
    return next()
  }
  if (req.body.email || req.body.password || req.body.phoneNumber) {
    res.locals.json = {
      statusCode: 403,
      message: 'Forbidden action'
    }
    return next()
  }
  await User.findByIdAndUpdate(req.params.id, {
    $set: req.body
  })
    .then((user) => {
      res.locals.json = {
        statusCode: 200,
        date: _.pick(user, ['email', 'phoneNumber'])
      }
      return next()
    })
    .catch((err) => {
      res.locals.json = {
        statusCode: 400,
        message: 'Cannot update user'
      }
      return next()
    })
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
