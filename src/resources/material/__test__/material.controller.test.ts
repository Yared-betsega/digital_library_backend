import mongoose from 'mongoose'
import { User } from '../../../resources/user/user.model'
import bcrypt from 'bcrypt'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'
import request from 'supertest'
import { app } from '../../../server'
import supertest from 'supertest'

beforeAll(async () => {
  await setUp()
}, 10000)

afterEach(async () => {
  await dropCollections()
}, 10000)

afterAll(async () => {
  await dropDatabase()
}, 10000)

describe('upload material', () => {
  it('should return status code 400 no file is sent', async () => {
    const response = await supertest(app).post('/api/v1/material').send({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: 'abcd',
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: 'abcd',
      viewCount: 134,
      course: 'Deep learning',
      department: 'AI'
    })
    expect(response.body.statusCode).toBe(400)
    expect(response.body.message).toBe('Please upload book')
  })
  it('should return status code 400 when one field is missing', async () => {
    const response = await supertest(app)
      .post('/api/v1/material')
      .field('type', 'Book')
      .field('title', 'knapsack')
      .field('user', '6305ca10efc036bc0cf539fa')
      .field('levelOfEducation', 'University')
      .field('course', 'AI')
      .attach('book', 'src/resources/material/testFiles/knapsack.pdf')

    expect(response.body.statusCode).toBe(400)
  })
  it('should return status code 201 on successful creation', async () => {
    const response = await supertest(app)
      .post('/api/v1/material')
      .field('type', 'Book')
      .field('title', 'knapsack')
      .field('department', 'SoftwareEngineering')
      .field('user', '6305ca10efc036bc0cf539fa')
      .field('levelOfEducation', 'University')
      .field('course', 'AI')
      .attach('book', 'src/resources/material/testFiles/knapsack.pdf')
      .on('error', (error) => {
        console.log(error.message)
      })
    expect(response.body.statusCode).toBe(201)
  })
})
