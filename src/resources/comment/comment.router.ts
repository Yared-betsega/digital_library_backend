import { Router } from 'express'
import { respond } from '../../middlewares/respond'
import { addComment } from './comment.controllers'
import { verifyToken } from '../../middlewares/verifyToken'
import { getComment } from './comment.controllers'

const commentRouter = Router()

commentRouter.post('/', verifyToken, addComment, respond)
commentRouter.get('/getComments/:materialId', getComment, respond)

export default commentRouter
