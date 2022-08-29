import { Request, Response, NextFunction } from 'express'

export const checkRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.email && !req.body.phoneNumber) {
    return res.status(400).json({
      statusCode: 400,
      message: 'phone or email are required'
    })
  }
  return next()
}
