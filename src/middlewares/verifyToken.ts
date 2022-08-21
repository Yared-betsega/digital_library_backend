import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('x-auth-token')

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Access Denied'
    })
  }

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.body.user = verified
    return next()
  } catch (error) {
    res.status(401).json({
      statusCode: 401,
      message: 'Invalid Token!'
    })
  }
}
