import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library'
import { Request, Response, NextFunction } from 'express'

const client: OAuth2Client = new OAuth2Client(process.env.OAUTH_CLIENT_ID)

export const verifyGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /**Verify the idToken sent by google to be from a trusted source and
     * verify the user is successfully authenticated by Google
     */
    const ticket: LoginTicket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.OAUTH_CLIENT_ID
    })
    const payload: TokenPayload = ticket.getPayload()!
    if (!payload || !payload.email_verified) {
      res.status(401).json({
        message: 'Email Not Verified By Google!',
        error: true
      })
    }

    /**Populate the req.body.user element with the user
     * information to be used by the next middleware */
    req.body.user = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      email_verified: payload.email_verified
    }
    next()
  } catch (error) {
    res.status(400).json({
      message: 'Something Went Wrong!',
      error: true
    })
  }
}
