import express from 'express'
import { respond } from '../../middlewares/respond'
import {
  createMaterial,
  fetchMaterialById,
  popular
} from './material.controllers'
import { Router } from 'express'
import { recommend } from './material.controllers'
import { isAuthenticated } from '../../middlewares/isAuthenticated'
import { filterBook } from '../../middlewares/multer'

const materialRouter = Router()

materialRouter.get('/popular', popular, respond)
materialRouter.get('/:id', fetchMaterialById, respond)
materialRouter.post('/recommend', isAuthenticated, recommend, respond)
materialRouter.post('/', filterBook.single('book'), createMaterial, respond)
export default materialRouter
