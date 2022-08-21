import { NextFunction, Request, Response } from 'express'
import { sendMail } from '../../helpers/mail'
import { generateOTP } from '../../helpers/otp'
import { OTP } from '../../resources/OTP/otp.model'
import { User } from '../../resources/user/user.model'

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    res.locals = {
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
      link: `http://localhost:5000/forgotPassword/${email}/${OTPGenerated}`,
      type: 'link'
    })
    res.locals = {
      statusCode: 200,
      message: 'A link to changing password sent to your email'
    }
    return next()
  } catch (error) {
    res.locals = {
      statusCode: 500,
      message: 'Something went wrong'
    }
    return next()
  }
}
