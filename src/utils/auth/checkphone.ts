import { User } from '../../resources/user/user.model'

export const checkPhone = async function (req, res, next) {
  if (!req.body.phoneNumber) {
    return (res.locals.json = {
      statusCode: 400,
      message: 'PhoneNumber is required'
    })
  }

  let phoneNum = req.body.phoneNumber
  let phone = await User.findOne({ phoneNumber: phoneNum })

  if (!phone) {
    res.locals.json = {
      statusCode: 200,
      message: 'The phone number is not Registered'
    }
  } else {
    res.locals.json = {
      statusCode: 400,
      message: 'The phone number is Registered'
    }
  }
  next()
}
