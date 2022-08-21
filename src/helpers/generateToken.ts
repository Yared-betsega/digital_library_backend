import JWT from 'jsonwebtoken'
export const generateToken = (user) => {
  return JWT.sign(
    {
      id: user._id
    },
    process.env.ACCESS_TOKEN_SECRET
  )
}
