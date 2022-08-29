import { IUserInterface, User } from '../../resources/user/user.model'
import bcrypt from 'bcrypt'

import _, { isEmpty } from 'lodash'
import admin from 'firebase-admin'
import { initializeApp, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { serviceAdmin } from './serviceAdmin'
import Joi from 'joi'
import { validatePassword, validatePhone } from '../../validators/validator'
import { PhoneResult } from 'phone'
const app: App = initializeApp({
  credential: admin.credential.cert(serviceAdmin)
})

export const signUpWithPhone = async (req, res) => {
  const { token, phoneNumber, firstName, lastName, password } = req.body
  const validate: PhoneResult = validatePhone(phoneNumber)
  if (validate.isValid == false) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Not valid phone number'
    })
  }
  const user = {
    phoneNumber,
    password,
    firstName,
    lastName
  }
  const inputValidation: Joi.ValidationResult<any> = validatePassword(user)
  if (inputValidation.error) {
    return res.status(400).json({
      statusCode: 400,
      message: inputValidation.error.details[0].message
    })
  }
  const userExists = await User.find({
    phoneNumber: phoneNumber
  })

  if (!isEmpty(userExists)) {
    return res.status(400).json({
      statusCode: 400,
      message: 'User is already registerd'
    })
  }

  getAuth()
    .verifyIdToken(token)
    .then(async (decodedToken) => {
      const verified = true

      const salt: any = await bcrypt.genSalt(10)
      const hashedPassword: any = await bcrypt.hash(password, salt)

      const newUser = new User({
        phoneNumber: phoneNumber,
        firstName,
        lastName,
        password: hashedPassword,
        isVerified: verified
      })

      const savedUser: IUserInterface = await newUser.save()

      return res.status(200).json({
        statusCode: 200,
        data: _.pick(savedUser, [
          'firstName',
          'lastName',
          'phoneNumber',
          'isVerified'
        ])
      })
    })
    .catch((error) => {
      return res.status(400).json({
        statusCode: 400,
        message: "Couldn't verify user"
      })
    })
}
