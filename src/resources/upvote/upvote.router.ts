import { Router } from 'express'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'
import { upvote } from './upvote.controller'
export const upvoteRouter = Router()

upvoteRouter.post('/:id', verifyToken, upvote, respond)
