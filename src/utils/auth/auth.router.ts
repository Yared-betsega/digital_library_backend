import express from 'express'
import { verifyEmail, resendCode, signUpWithEmail } from './signup'
import { signinWithEmail } from './signin'
import { signinWithPhone } from './signin'
import { verifyGoogle } from '../../middlewares/continueWithGoogle'
import { continueWithGoogle } from './continue-with-google'
import { forgotPassword } from './forgotPassword'
import { resetPassword } from './resetPassword'
import { respond } from '../../middlewares/respond'
import { signUpWithPhone } from './signup.withPhone'
import { checkPhone } from './checkphone'
import { verifyToken } from '../../middlewares/verifyToken'
import { changePassword } from './changePassword'

const authRouter = express.Router()

authRouter.post('/signup-with-email', signUpWithEmail, respond)
authRouter.post('/verify', verifyEmail, respond)
authRouter.post('/resendCode', resendCode, respond)
authRouter.post('/signin-with-email', signinWithEmail, respond)
authRouter.post('/signin-with-phone', signinWithPhone, respond)
authRouter.post('/signup-with-phone', signUpWithPhone, respond)
authRouter.post(
  '/continue-with-google',
  verifyGoogle,
  continueWithGoogle,
  respond
)
authRouter.post('/forgotPassword', forgotPassword, respond)
authRouter.post('/resetPassword', resetPassword, respond)
authRouter.get('/checkPhone', checkPhone, respond)
authRouter.put('/changePassword/:userId', verifyToken, changePassword, respond)

export default authRouter
