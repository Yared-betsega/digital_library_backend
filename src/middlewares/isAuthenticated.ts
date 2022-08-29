import { Request, Response, NextFunction } from 'express'
import JWT from 'jsonwebtoken'
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token !== null) {
    try {
      const payload = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals = JSON.parse(JSON.stringify(payload))
      return next()
      
    } catch (error) {
      res.locals = {
        payload: null
      }
      return next()
    }
  }
  return next()
}
