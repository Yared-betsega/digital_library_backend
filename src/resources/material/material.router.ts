import express from 'express'
import { respond } from '../../middlewares/respond'
import {
  createMaterial,
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

materialRouter.get('/popular', popular, respond)
materialRouter.get('/recommend', isAuthenticated, recommend, respond)
materialRouter.get('/filter', extractTags, filter, respond)
materialRouter.get('/search', search, respond)
materialRouter.get('/materialsForEachYear', filterByEachYear, respond)
materialRouter.get('/:id', fetchMaterialById, respond)
materialRouter.post('/', filterBook.single('book'), createMaterial, respond)
export default materialRouter
