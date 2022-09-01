import { Router } from 'express'
import { respond } from '../../middlewares/respond'
import { addComment, deleteComment } from './comment.controllers'
import { verifyToken } from '../../middlewares/verifyToken'
import { getComment } from './comment.controllers'

const commentRouter = Router()

commentRouter.post('/', verifyToken, addComment, respond)
commentRouter.get('/getComments/:materialId', getComment, respond)
commentRouter.delete('/:commentId', verifyToken, deleteComment, respond)
export default commentRouter
