import { Router } from 'express'
import {
  deleteAll,
  deleteUser,
  fetchAllUsers,
  fetchUserByEmail,
  updateUser,
  fetchUserById,
  topContributors,
  myFavorites,
  myMaterials,
  getUserById
} from './user.controllers'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'
import { filterImage } from '../../middlewares/multer'
import { isAuthenticated } from '../../middlewares/isAuthenticated'

const userRouter = Router()
userRouter.get('/myFavorites', verifyToken, myFavorites, respond)
userRouter.get('/myMaterials/:id', isAuthenticated, myMaterials, respond)
userRouter.get('/all', fetchAllUsers, respond)
userRouter.get('/:email', fetchUserByEmail, respond)
userRouter.post('/deleteAll', deleteAll, respond)
userRouter.delete('/:email', deleteUser, respond)
userRouter.put(
  '/',
  verifyToken,
  filterImage.single('image'),
  updateUser,
  respond
)
userRouter.get('/', verifyToken, fetchUserById, respond)
userRouter.get('/topContributors', topContributors)
userRouter.get('/id/:userId', getUserById, respond)
export = userRouter
