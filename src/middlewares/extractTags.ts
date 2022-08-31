import { NextFunction, Request, Response } from 'express'

export const extractTags = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const queryParams = req.query

  var tags = {}
  for (var key in queryParams) {
    if (key !== 'skip' && key !== 'limit') {
      tags[key] = queryParams[key]
    }
  }
  res.locals = {
    tags
  }
  return next()
}
