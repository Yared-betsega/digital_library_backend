import Joi from 'joi'
import passwordComplexity from 'joi-password-complexity'

const phone = require('phone')
export const validatePhone = (userPhoneNum) => {
  return phone.phone(userPhoneNum)
}

export const validatePassword = (user) => {
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
    firstName: Joi.string().min(1).max(55).required(),
    lastName: Joi.string().min(1).max(55).required(),
    phoneNumber: Joi.string().min(10),
    password: passwordComplexity(complexityOptions, label) // This is not working
  })
  return schema.validate(user)
}
