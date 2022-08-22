import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { User } from '../../../resources/user/user.model'
import { app } from '../../../server'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'
jest.setTimeout(100000)
describe('Siginin Test', () => {
  beforeAll(async () => {
    await setUp()
  }, 30000)

  afterEach(async () => {
    await dropCollections()
  }, 30000)

  afterAll(async () => {
    await dropDatabase()
  }, 30000)

  it('should return a valid token given valid phone and password', async () => {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash('this is a password', salt)
    const user = await User.create({
      email: 'henok@gmail.com',
      phoneNumber: '0987654321',
      password: hashed,
      isVerified: true
    })

    const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)

    const payload = {
      phoneNumber: user.phoneNumber,
      password: 'this is a password'
    }
    const { body, status } = await request(app)
      .post('/api/v1/auth/login')
      .send(payload)
    expect(status).toBe(200)
  })

  it('should send back a 401 status if provided with an invalid phone', async () => {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash('this is a password', salt)

    const user = await User.create({
      email: 'henok@gmail.com',
      phoneNumber: '0987654321',
      password: hashed,
      isVerified: true
    })

    const payload = {
      phoneNumber: 'wrong phone',
      password: 'this is a password'
    }
    const { body, status } = await request(app)
      .post('/api/v1/auth/login')
      .send(payload)
    expect(status).toBe(401)
  })

  it('should send back a 401 status if provided with an invalid password', async () => {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash('this is a password', salt)

    const user = await User.create({
      email: 'henok@gmail.com',
      phoneNumber: '0987654321',
      password: hashed,
      isVerified: true
    })

    const payload = {
      phoneNumber: user.phoneNumber,
      password: 'this is an invalid password'
    }
    const { body, status } = await request(app)
      .post('/api/v1/auth/login')
      .send(payload)
    expect(status).toBe(401)
  })

  it('should send back a 401 status if user if not verified', async () => {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash('this is a password', salt)

    const user = await User.create({
      email: 'henok@gmail.com',
      phoneNumber: '0987654321',
      password: hashed,
      isVerified: false
    })

    const payload = {
      phoneNumber: user.phoneNumber,
      password: 'this is a password'
    }
    const { body, status } = await request(app)
      .post('/api/v1/auth/login')
      .send(payload)
    expect(status).toBe(401)
  })
})
