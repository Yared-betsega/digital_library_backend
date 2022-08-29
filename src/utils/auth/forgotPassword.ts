import { NextFunction, Request, Response } from 'express'
import { sendMail } from '../../helpers/mail'
import { generateOTP } from '../../helpers/otp'
import { OTP } from '../../resources/OTP/otp.model'
import { User } from '../../resources/user/user.model'
import { getAuth } from 'firebase-admin/auth'
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  if (!req.body.email) {
    return next()
  }
  const user = await User.findOne({ email })
  if (!user) {
    res.locals.json = {
      statusCode: 404,
      message: 'User Not found'
    }
    return next()
  }

  const OTPGenerated = generateOTP(6)
  const otp = await OTP.findOne({ email })
  if (otp) {
    otp.otpCode = OTPGenerated
    await otp.save()
  } else {
    await OTP.create({
      email,
      OTPGenerated
    })
  }
  try {
    const info = await sendMail({
      to: email,
      link: `http://localhost:3000/auth/reset-password/?email=${email}&otp=${OTPGenerated}`,
      type: 'link'
    })
    res.locals.json = {
      statusCode: 200,
      message: 'A link to changing password sent to your email'
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 500,
      message: 'Something went wrong'
    }
    return next()
  }
}
export const forgotPasswordWithPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.email || !req.body.phoneNumber) {
    return next()
  }
  const { token, phoneNumber } = req.body

  const user = await User.findOne({ phoneNumber })
  if (!user) {
    res.locals.json = {
      statusCode: 404,
      message: 'User Not found'
    }
    return next()
  }
  if (!token) {
    res.locals.json = {
      statusCode: 404,
      message: 'Token Not found'
    }
    return next()
  }
  getAuth()
    .verifyIdToken(token)
    .then(async (decodedToken) => {
      res.locals.json = {
        statusCode: 200,
        token: token
      }
      return next()
    })

    .catch((error) => {
      console.log(error)
      res.locals.json = {
        statusCode: 400,
        message: "Couldn't verify user"
      }
      return next()
    })
}
