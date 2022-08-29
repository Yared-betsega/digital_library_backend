import { Router } from 'express'
import {
  deleteAll,
  deleteUser,
  fetchAllUsers,
  fetchUserByEmail,
  updateUser,
<<<<<<< HEAD
  fetchUserById
=======
  fetchUserById,
  topContributors
>>>>>>> 581d1ce6ced5109a94b7dfc0824e2c5cfa3b3986
} from './user.controllers'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'

const userRouter = Router()

userRouter.get('/all', fetchAllUsers, respond)
userRouter.get('/:email', fetchUserByEmail, respond)
userRouter.post('/deleteAll', deleteAll, respond)
userRouter.delete('/:email', deleteUser, respond)
userRouter.put('/:id', verifyToken, updateUser, respond)
userRouter.get('/', verifyToken, fetchUserById, respond)
<<<<<<< HEAD
=======
userRouter.get('/topContributors', topContributors)
>>>>>>> 581d1ce6ced5109a94b7dfc0824e2c5cfa3b3986
export = userRouter
