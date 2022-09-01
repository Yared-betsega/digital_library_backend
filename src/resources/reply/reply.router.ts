import { Router } from 'express'
import { respond } from '../../middlewares/respond'
import { updateReply } from '../reply/reply.controller'
import { verifyToken } from '../../middlewares/verifyToken'
import { addReply, deleteReply, getAll, getReply } from './reply.controller'
export const replyRouter = Router()

replyRouter.post('/', verifyToken, addReply, respond)
replyRouter.put('/', verifyToken, updateReply, respond)
replyRouter.get('/:id', getReply, respond)
replyRouter.get('/', getAll, respond)
replyRouter.delete('/:id', verifyToken, deleteReply, respond)
