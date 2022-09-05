import supertest from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import JWT from 'jsonwebtoken'
import { app } from '../../../server'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'
import { User } from '../user.model'
import { getUserById } from '../user.controllers'

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

const prototype = {
  email: user1.email,
  firstName: user1.firstName,
  middleName: user1.middleName,
  lastName: user1.lastName,
  bio: user1.bio,
  educationPlace: user1.educationPlace
}

let user: any
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
    token = JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)
  })
  afterAll(async () => {
    await dropDatabase()
  })
  describe(' getUserById controller test', () => {
    it('should return a 200 statusCode, and the user given valid inputs', async () => {
      const { statusCode, body } = await supertest(app).get(
        `/api/v1/user/id/${user._id}`
      )
      expect(statusCode).toBe(200)
      expect(body.data).toMatchObject(prototype)
    })
    it('should return a 400 statusCode, given an invalid userId', async () => {
      const { statusCode, body } = await supertest(app).get(
        `/api/v1/user/id/${new mongoose.Types.ObjectId()}`
      )
      expect(statusCode).toBe(400)
      expect(body.message).toBeDefined()
    })
    it('should return a 400 statusCode, given an invalid userId', async () => {
      const { statusCode, body } = await supertest(app).get(
        `/api/v1/user/id/invalidId`
      )
      expect(statusCode).toBe(400)
      expect(body.message).toBeDefined()
    })
  })
})
