import supertest from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import JWT from 'jsonwebtoken'
import { app } from '../../../server'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'
import { User } from '../../user/user.model'

dotenv.config()

jest.setTimeout(20000)

const user1 = {
  email: 'fitsumabyu@gmail.com',
  password: 'fitsumabyupass',
  firstName: 'Fitsum',
  middleName: 'Abyu',
  lastName: 'Engida',
  bio: 'I am a G31 A2SVian',
  educationPlace: 'Addis Ababa'
}

let user: any
let material: any
let token: any

describe('Comment controller test', () => {
  beforeAll(async () => {
    await setUp()
  })
  beforeEach(async () => {
    await dropCollections()
    try {
      user = await User.create(user1)
    } catch (err) {
      console.log(err)
    }
    let response: any
    try {
      response = await supertest(app)
        .post('/api/v1/material')
        .field('type', 'Book')
        .field('title', 'knapsack')
        .field('department', 'AI')
        .field('user', user._id.toString())
        .field('levelOfEducation', 'University')
        .field('course', 'AI')
        .attach('book', 'src/resources/material/testFiles/knapsack.pdf')
    } catch (error) {
      console.log('error is' + error)
    }
    material = response.body.data
    token = JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)
  })
  afterAll(async () => {
    await dropDatabase()
  })
  describe(' addComment controller test', () => {
    it('should return a 201 statusCode, and the created comment given a valid input', async () => {
      const commentPrototype = {
        materialId: material._id,
        content: 'This book is really good'
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/comment')
        .set('authorization', 'Bearer ' + token)
        .send(commentPrototype)
      expect(statusCode).toBe(201)
      expect(body.data.content).toBe(commentPrototype.content)
    })
    it('should return a 400 statusCode, given an invalid material id', async () => {
      const commentPrototype = {
        materialId: new mongoose.Types.ObjectId(),
        content: 'This book is really good'
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/comment')
        .set('authorization', 'Bearer ' + token)
        .send(commentPrototype)
      expect(statusCode).toBe(400)
      expect(body.message).toBeDefined()
    })
    it('should return a 400 statusCode, given not givene content', async () => {
      const commentPrototype = {
        materialId: material._id,
        userId: user._id
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/comment')
        .set('authorization', 'Bearer ' + token)
        .send(commentPrototype)
      expect(statusCode).toBe(400)
      expect(body.message).toBeDefined()
    })
    it('should return a 400 status code if given with an invalid content', async () => {
      const commentPrototype = {
        materialId: material._id,
        content: ''
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/comment')
        .set('authorization', 'Bearer ' + token)
        .send(commentPrototype)
      expect(statusCode).toBe(400)
      expect(body.message).toBeDefined()
    })
  })
})
