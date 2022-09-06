import { Router } from 'express'
import { respond } from '../../middlewares/respond'
import { verifyToken } from '../../middlewares/verifyToken'
import { addCourse, addCourses, getCourse } from './course.controller'

const courseRouter = Router()

courseRouter.get('/getCourses', getCourse, respond)
courseRouter.post('/addCourse', addCourse, respond)
// courseRouter.post('/godMode', addCourses)
export default courseRouter
