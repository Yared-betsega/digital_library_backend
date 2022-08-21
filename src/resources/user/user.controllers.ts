import { Request, Response, NextFunction } from 'express'
import { User, IUserInterface } from './user.model'
import JWT from 'jsonwebtoken'
import { OTP } from '../OTP/otp.model'
import { generateToken } from '../../helpers/generateToken'
import { v4 as uuidv4 } from 'uuid'
import { userInfo } from 'os'
import _ from 'lodash'
export const fetchAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await User.find({})
  res.locals = {
    statusCode: 200,
    data: users
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
    res.locals = {
      statusCode: 404,
      message: "A user with the given email doesn't exist"
    }
    return next()
  }
  res.locals = {
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
  if (req.params.id !== req.body.user._id) {
    res.locals = {
      statusCode: 403,
      message: 'You are not authorized to edit this account'
    }
    return next()
  }
  if (req.body.email || req.body.password || req.body.phoneNumber) {
    res.locals = {
      statusCode: 403,
      message: 'Forbidden action'
    }
    return next()
  }
  await User.findByIdAndUpdate(req.params.id, {
    $set: req.body
  })
    .then((user) => {
      res.locals = {
        statusCode: 200,
        date: _.pick(user, ['email', 'phoneNumber'])
      }
      return next()
    })
    .catch((err) => {
      res.locals = {
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
    res.locals = {
      statusCode: 400,
      message: 'Cannot remove account'
    }
    return next()
  }

  const otp = await OTP.deleteOne({ email })
  res.locals = {
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
    res.locals = {
      statusCode: 200,
      message: 'All accounts deleted'
    }
    return next()
  } catch (error) {
    res.locals = {
      statusCode: 400,
      message: 'Cannot delete all accounts'
    }
    return next()
  }
}
