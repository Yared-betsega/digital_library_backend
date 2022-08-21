import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User } from '../../../resources/user/user.model'
import { app } from '../../../server'
import supertest from 'supertest'
import { setUp, dropCollections, dropDatabase } from '../../db/connect'
let mongoServer: any
jest.setTimeout(100000)
beforeAll(async () => {
  await setUp()
}, 30000)

afterEach(async () => {
  await dropCollections()
}, 30000)
afterAll(async () => {
  await dropDatabase()
}, 30000)

describe('Signup Test', () => {
  it('return status code 201 if the user is successfully created', async () => {
    await supertest(app)
      .post('/api/v1/auth/signup-with-email')
      .send({
        firstName: 'yared',
        lastName: 'Tsegaye',
        email: 'testEmail@gmail.com',
        password: '123Abc!sasa'
      })
      .expect(201)
  })
})
