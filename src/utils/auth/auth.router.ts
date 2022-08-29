import express from 'express'
import { verifyEmail, resendCode, signUpWithEmail } from './signup'
import { signinWithEmail } from './signin'
import { signinWithPhone } from './signin'
import { verifyGoogle } from '../../middlewares/continueWithGoogle'
import { continueWithGoogle } from './continue-with-google'
import { forgotPassword, forgotPasswordWithPhone } from './forgotPassword'
import { resetPassword, resetPasswordWithPhone } from './resetPassword'
import { respond } from '../../middlewares/respond'
import { signUpWithPhone } from './signup.withPhone'
import { checkPhone } from './checkphone'
import { verifyToken } from '../../middlewares/verifyToken'
import { changePassword } from './changePassword'
import { checkRequest } from '../../middlewares/checkRequest'
import { isUserRegistered } from './isUserRegistered'
const authRouter = express.Router()

authRouter.post('/signup-with-email', signUpWithEmail, respond)
authRouter.post('/verify', verifyEmail, respond)
authRouter.post('/resendCode', resendCode, respond)
authRouter.post(
  '/login',
  checkRequest,
  signinWithEmail,
  signinWithPhone,
  respond
)
// authRouter.post('/signin-with-phone', signinWithPhone, as,respond)
authRouter.post('/signup-with-phone', signUpWithPhone, respond)
authRouter.post(
  '/continue-with-google',

  verifyGoogle,
  continueWithGoogle,
  respond
)
authRouter.post(
  '/forgotPassword',

  checkRequest,
  forgotPassword,
  forgotPasswordWithPhone,
  respond
)
authRouter.post(
  '/resetPassword',

  checkRequest,
  resetPassword,
  resetPasswordWithPhone,
  respond
)

authRouter.post('/checkPhone', checkPhone, respond)
authRouter.put('/changePassword', verifyToken, changePassword, respond)

authRouter.post('/isUserRegistered', isUserRegistered, respond)

export default authRouter
