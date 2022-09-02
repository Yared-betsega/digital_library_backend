import { Router } from 'express'
import {
  deleteAll,
  deleteUser,
  fetchAllUsers,
  fetchUserByEmail,
  updateUser,
  fetchUserById,
  topContributors,
  myFavorites
} from './user.controllers'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'
import { isAuthenticated } from '../../middlewares/isAuthenticated'
import { User } from './user.model'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
import { Material } from '../material/material.model'
import { Upvote } from '../upvote/upvote.model'
const userRouter = Router()
userRouter.get('/myFavorites', verifyToken, myFavorites, respond)
userRouter.get('/all', fetchAllUsers, respond)
userRouter.get('/:email', fetchUserByEmail, respond)
userRouter.post('/deleteAll', deleteAll, respond)
userRouter.delete('/:email', deleteUser, respond)
userRouter.put('/:id', verifyToken, updateUser, respond)
userRouter.get('/', verifyToken, fetchUserById, respond)
userRouter.get('/topContributors', topContributors)
export = userRouter
