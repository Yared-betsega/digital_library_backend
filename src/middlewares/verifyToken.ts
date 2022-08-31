import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Access Denied'
    })
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals = JSON.parse(JSON.stringify(payload))
    return next()
  } catch (error) {
    console.log(error)
    res.status(401).json({
      statusCode: 401,
      message: 'Invalid Token!'
    })
  }
}
