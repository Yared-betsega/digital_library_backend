import { Router } from 'express'
import {
  deleteAll,
  deleteUser,
  fetchAllUsers,
  fetchUserByEmail,
  updateUser
} from './user.controllers'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'

const userRouter = Router()

userRouter.get('/', fetchAllUsers, respond)
userRouter.get('/:email', fetchUserByEmail, respond)
userRouter.post('/deleteAll', deleteAll, respond)
userRouter.delete('/:email', deleteUser, respond)
userRouter.put('/:id', verifyToken, updateUser, respond)
export = userRouter
