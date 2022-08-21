import { Request, Response, NextFunction } from 'express'
import { User, IUserInterface } from '../../resources/user/user.model'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'

dotenv.config()

export const signinWithEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    })

    if (!user) {
      res.locals = {
        statusCode: 401,
        message: 'Incorrect email or password'
      }
      return next()
    }

    const isMatched = await bcrypt.compare(req.body.password, user.password)
    if (!isMatched) {
      res.locals = {
        statusCode: 401,
        message: 'Incorrect email or password'
      }
      return next()
    }

    if (!user.isVerified) {
      res.locals = {
        statusCode: 401,
        message: 'User is not verified'
      }
      return next()
    }

    const token = JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)
    res.locals = {
      statusCode: 200,
      data: {
        token: token
      }
    }
    return next()
  } catch (error) {
    res.locals = {
      statusCode: 500,
      message: 'Sign in failed'
    }
    return next()
  }
}

export const signinWithPhone = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { phoneNumber, password } = req.body
  const user = await User.findOne({ phoneNumber: phoneNumber })
  if (!user) {
    res.locals = {
      statusCode: 401,
      message: 'Incorrect phone number or password'
    }
    return next()
  }

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    res.locals = {
      statusCode: 401,
      message: 'Incorrect phone number or password'
    }
    return next()
  }

  if (!user.isVerified) {
    res.locals = {
      statusCode: 401,
      message: 'User is not verified'
    }
    return next()
  }

  const token = JWT.sign({ _id: user._id }, process.env.ACCESS_SECRET_TOKEN)
  res.locals = {
    statusCode: 200,
    token: token
  }
  return next()
}
