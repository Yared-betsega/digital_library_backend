import mongoose from 'mongoose'
import { User } from '../../../resources/user/user.model'
import bcrypt from 'bcrypt'
import { setUp, dropDatabase, dropCollections } from '../../db/connect'
import request from 'supertest'
import { app } from '../../../server'

beforeAll(async () => {
  await setUp()
}, 10000)

afterEach(async () => {
  await dropCollections()
}, 10000)

afterAll(async () => {
  await dropDatabase()
}, 10000)

describe('signin with email', () => {
  it('should send back a JWT with 200 status', async () => {
    const password = 'fitsumabyupass'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = User.create({
      email: 'fitsumabyu@gmail.com',
      password: hashedPassword,
      isVerified: true
    })

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'fitsumabyu@gmail.com',
      password: password
    })
    expect(res.status).toBe(200)
  })

  describe('otherwise', () => {
    it('should send back a 401 status if provided with an invalid email', async () => {
      const password = 'fitsumabyupass'
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const user = User.create({
        email: 'fitsumabyu@gmail.com',
        password: hashedPassword,
        isVerified: true
      })

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'fitsumayu@gmail.com',
        password: password
      })
      expect(res.status).toBe(401)
    })
    it('should send back a 401 status if provided with an invalid password', async () => {
      const password = 'fitsumabyupass'
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const user = User.create({
        email: 'fitsumabyu@gmail.com',
        password: hashedPassword,
        isVerified: true
      })

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'fitsumabyu@gmail.com',
        password: 'invalidPassword'
      })
      expect(res.status).toBe(401)
    })
    it('should send back a 401 status if user if not verified', async () => {
      const password = 'fitsumabyupass'
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const user = User.create({
        email: 'fitsumabyu@gmail.com',
        password: hashedPassword,
        isVerified: false
      })

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'fitsumabyu@gmail.com',
        password: password
      })
      expect(res.status).toBe(401)
    })
  })
})
