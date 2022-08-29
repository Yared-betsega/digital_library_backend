import { NextFunction, Request, Response } from 'express'
import { encrypt } from '../../helpers/encryptPassword'
import { generateOTP } from '../../helpers/otp'
import { OTP } from '../../resources/OTP/otp.model'
import { IUserInterface, User } from '../../resources/user/user.model'
import { getAuth } from 'firebase-admin/auth'
import _ from 'lodash'
import { validateInput } from './changePassword'

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.email) {
    return next()
  }
  const { email, otp, newPassword } = req.body
  if (!email) {
    return next()
  }
  const user = await User.findOne({ email })

  if (!user) {
    res.locals.json = {
      statusCode: 404,
      message: 'User not found!'
    }
    return next()
  }
  const originalOTP = await OTP.findOne({ email })
  if (!otp || !originalOTP || !user.isVerified || !newPassword) {
    res.locals.json = {
      statusCode: 400,
      message: 'Cannot Change Password'
    }
    return next()
  }

  if (otp !== originalOTP.otpCode) {
    res.locals.json = {
      statusCode: 403,
      message: 'You are forbidden to do the changes'
    }
    return next()
  }
  user.password = await encrypt(newPassword)
  await user.save()
  originalOTP.otpCode = generateOTP(12)
  await originalOTP.save()
  res.locals.json = {
    statusCode: 200,
    message: 'Password Successfully changed!'
  }
  return next()
}

export const resetPasswordWithPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.email || !req.body.phoneNumber) {
    return next()
  }
  const { token, phoneNumber, newPassword } = req.body

  if (!phoneNumber) {
    return next()
  }
  const user = await User.findOne({ phoneNumber })
  if (!user) {
    res.locals.json = {
      statusCode: 404,
      message: 'User Not found'
    }
    return next()
  }
  if (!newPassword) {
    return next()
  }
  const validPassword = validateInput(newPassword)
  if (validPassword.error) {
    res.locals.json = {
      statusCode: 400,
      message: validPassword.error.details[0].message
    }
    return next()
  }

  getAuth()
    .verifyIdToken(token)
    .then(async (decodedToken) => {
      user.password = await encrypt(newPassword)
      const savedUser: IUserInterface = await user.save()
      res.locals.json = {
        statusCode: 200,
        message: 'Password Successfully changed!'
      }
      return next()
    })
    .catch((error) => {
      res.locals.json = {
        statusCode: 400,
        message: "Couldn't verify user"
      }
      return next()
    })
}
