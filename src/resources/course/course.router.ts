import { Router } from 'express'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'
import { addCourse, getCourse } from './course.controller'

const courseRouter = Router()

courseRouter.get('/getCourses', getCourse, respond)
courseRouter.post('/addCourse', addCourse, respond)

export default courseRouter
