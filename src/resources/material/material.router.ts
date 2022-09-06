import express from 'express'
import { respond } from '../../middlewares/respond'
import {
  createBookMaterial,
  createVideoMaterial,
  fetchMaterialById,
  filter,
  filterByEachYear,
  popular,
  resetUpvote,
  search,
  searchCourses
} from './material.controllers'
import { Router } from 'express'
import { recommend, createQuizMaterial } from './material.controllers'
import { isAuthenticated } from '../../middlewares/isAuthenticated'
import { filterBook } from '../../middlewares/multer'
import { extractTags } from '../../middlewares/extractTags'
import { verifyToken } from '../../middlewares/verifyToken'

const materialRouter = Router()

materialRouter.get('/popular', isAuthenticated, popular, respond)
materialRouter.get('/recommend', isAuthenticated, recommend, respond)
materialRouter.get('/filter', filter, respond)
materialRouter.get('/search', search, respond)
materialRouter.get('/courses', searchCourses, respond)
materialRouter.get('/materialsForEachYear', filterByEachYear, respond)
materialRouter.get('/:id', isAuthenticated, fetchMaterialById, respond)
materialRouter.post(
  '/book',
  filterBook.single('book'),
  createBookMaterial,
  respond
)
materialRouter.post('/video', verifyToken, createVideoMaterial, respond)
materialRouter.post('/quiz', verifyToken, createQuizMaterial, respond)
// materialRouter.put('/godMode', resetUpvote)

export default materialRouter
