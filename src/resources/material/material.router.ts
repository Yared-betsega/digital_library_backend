import express from 'express'
import { respond } from '../../middlewares/respond'
import {
  createBookMaterial,
  createVideoMaterial,
  fetchMaterialById,
  filter,
  filterByEachYear,
  popular,
  search
} from './material.controllers'
import { Router } from 'express'
import { recommend } from './material.controllers'
import { isAuthenticated } from '../../middlewares/isAuthenticated'
import { filterBook } from '../../middlewares/multer'
import { extractTags } from '../../middlewares/extractTags'

const materialRouter = Router()

materialRouter.get('/popular', isAuthenticated, popular, respond)
materialRouter.get('/recommend', isAuthenticated, recommend, respond)
materialRouter.get('/filter', extractTags, filter, respond)
materialRouter.get('/search', search, respond)
materialRouter.get('/materialsForEachYear', filterByEachYear, respond)
materialRouter.get('/:id', fetchMaterialById, respond)
materialRouter.post(
  '/book',
  filterBook.single('book'),
  createBookMaterial,
  respond
)
materialRouter.post('/video', createVideoMaterial, respond)
export default materialRouter
