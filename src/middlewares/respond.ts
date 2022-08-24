import { NextFunction, Request, Response } from 'express'

export const respond = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(res.locals)
  res.status(res.locals.json.statusCode).json(res.locals.json)
}
