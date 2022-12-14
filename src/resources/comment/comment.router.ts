import { Router } from 'express'
import { respond } from '../../middlewares/respond'
import { addComment, getComment, updateComment, deleteComment } from './comment.controllers'
import { verifyToken } from '../../middlewares/verifyToken'

const commentRouter = Router()

commentRouter.post('/', verifyToken, addComment, respond)
commentRouter.get('/getComments/:materialId', getComment, respond)
commentRouter.patch('/:commentId', verifyToken, updateComment, respond)
commentRouter.put('/:commentId', verifyToken, updateComment, respond)
commentRouter.delete('/:commentId', verifyToken, deleteComment, respond)

export default commentRouter
