import { Request, Response, NextFunction } from 'express'
import { User } from '../../resources/user/user.model'
import bcrypt from 'bcrypt'
import { encrypt } from '../../helpers/encryptPassword'
import Joi from 'joi'
import passwordComplexity from 'joi-password-complexity'

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body
    const { _id } = res.locals
    const user = await User.findById(_id)
    if (!user) {
      res.locals.json = {
        statusCode: 404,
        message: 'User not found'
      }
      return next()
    }

    const isMatched = await bcrypt.compare(oldPassword, user.password)

    if (!isMatched) {
      res.locals.json = {
        statusCode: 401,
        message: 'Incorrect password'
      }
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

    user.password = await encrypt(newPassword)
    await user.save()

    res.locals.json = {
      statusCode: 200,
      message: 'Password updated successfully'
    }
    return next()
  } catch (err) {
    res.locals.json = {
      statusCode: 400,
      message: 'Could not change password'
    }
    return next()
  }
}

export function validateInput(password) {
  const complexityOptions = {
    min: 8,
    max: 30,
    lowercase: 1,
    uppercase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 3
  }

  const label = 'Password'
  const schema = Joi.object({
    password: passwordComplexity(complexityOptions, label) // This is not working
  })
  return schema.validate({ password: password })
}
