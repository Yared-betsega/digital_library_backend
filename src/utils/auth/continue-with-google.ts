import { Request, Response, NextFunction } from 'express'
import { User, IUserInterface } from '../../resources/user/user.model'
import { generateToken } from '../../helpers/generateToken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
export const continueWithGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /**Extract the required fields. */
    const { email, firstName, lastName, email_verified, picture } =
      req.body.user

    /**Check if the user already registered to the system
     * 1. If the user is already registered, respond with a token
     * 2. If it is a new user. Create a new account for the user and respond with a token
     */
    const userAlreadyExisted = await User.findOne({ email: email })

    //Account already exists
    if (userAlreadyExisted) {
      const token: String = generateToken(userAlreadyExisted)
      res.locals = {
        statusCode: 200,
        data: {
          token: token
        }
      }
      return next()
    }
    const salt = await bcrypt.genSalt(10)
    const password = uuidv4()
    const hashedPassword = await bcrypt.hash(password, salt)

    // Account is new
    const newUser: IUserInterface = await User.create({
      email: email,
      password: hashedPassword,
      isVerified: email_verified,
      firstName: firstName,
      lastName: lastName,
      photoURL: picture
    })
    //Respond with a token
    const token: String = generateToken(newUser)
    res.locals = {
      statusCode: 200,
      data: {
        email: email,
        token: token
      }
    }
    return next()
  } catch (error) {
    res.locals = {
      statusCode: 400,
      message: 'Google Signin Failed'
    }
    return next()
  }
}
