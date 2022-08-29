import { Router } from 'express'
import {
  deleteAll,
  deleteUserByEmail,
  fetchAllUsers,
  fetchUserByEmail,
  updateUser,
  fetchUserById,
  topContributors,
  deleteUserByPhone
} from './user.controllers'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'

const userRouter = Router()

userRouter.get('/all', fetchAllUsers, respond)
userRouter.get('/:email', fetchUserByEmail, respond)
userRouter.post('/deleteAll', deleteAll, respond)
userRouter.delete('/deleteByEmail/:email', deleteUserByEmail, respond)
userRouter.delete('/deleteByPhone/:phoneNumber', deleteUserByPhone, respond)
userRouter.put('/:id', verifyToken, updateUser, respond)
userRouter.get('/', verifyToken, fetchUserById, respond)
userRouter.get('/topContributors', topContributors)
export = userRouter
