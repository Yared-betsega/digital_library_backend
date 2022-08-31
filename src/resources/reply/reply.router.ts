import { Router } from 'express'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'
import { addReply, getAll, getReply } from './reply.controller'
export const replyRouter = Router()

replyRouter.post('/', verifyToken, addReply, respond)
replyRouter.get('/:id', getReply, respond)
replyRouter.get('/', getAll, respond)
