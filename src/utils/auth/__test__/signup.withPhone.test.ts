import { User } from '../../../resources/user/user.model'
import { setUp, dropCollections, dropDatabase } from '../../db/connect'
import request from 'supertest'
import { app } from '../../../server'
import { getAuth } from 'firebase-admin/auth'

beforeAll(async () => {
  setUp()
})

afterEach(async () => {
  await dropCollections()
})

afterAll(async () => {
  await dropDatabase()
})
const validDummy = {
  firstName: 'Feruz',
  lastName: 'Blen',
  phoneNumber: '+251976775645',
  password: 'abAd3303jdfj1!!!',
  token: 'generated token:'
}
const validDummy2 = {
  firstName: 'Feruz',
  lastName: 'Blen',
  phoneNumber: '+251976775647',
  password: 'abAd3303jdfj1!!!',
  token: 'generated token:'
}
const invalidPhoneDummy = {
  firstName: 'Feruz',
  lastName: 'Blen',
  phoneNumber: 'kjdfksjf',
  password: 'abcd3303jdfj1!!!'
}
const invalidPasswordDummy = {
  firstName: 'Feruz',
  lastName: 'Blen',
  phoneNumber: '+251976775645',
  password: '12345678'
}

describe('signup with phone', () => {
  it('should create and save new user if user is verified', async () => {
    const toBeReturned: any = {}
    jest.spyOn(getAuth(), 'verifyIdToken').mockResolvedValue(toBeReturned)
    const response = await request(app)
      .post('/api/v1/auth/signup-with-phone')
      .send(validDummy)

    expect(response.body.statusCode).toBe(200)
    expect(response.body.data.phoneNumber).toBe(validDummy.phoneNumber)
    expect(response.body.data.isVerified).toBe(true)
  })
  it('should fail if user is not verified', async () => {
    const toBeReturned: any = { error: "Couldn't verify user" }
    jest.spyOn(getAuth(), 'verifyIdToken').mockRejectedValue(toBeReturned)
    const response = await request(app)
      .post('/api/v1/auth/signup-with-phone')
      .send(validDummy)
    expect(response.status).toBe(400)
    expect(response.body.message).toStrictEqual(toBeReturned.error)
  })
  it('should fail if invalid password is given to it', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup-with-phone')
      .send(invalidPasswordDummy)

    expect(response.statusCode).toBe(400)
    expect(response.body.message).not.toBeNull()
  })
  it('should fail if invalid phone is given to it', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup-with-phone')
      .send(invalidPhoneDummy)
    expect(response.statusCode).toBe(400)
    // expect(response.body.messa)
    expect(response.body.message).not.toBeNull()
  })
  it('should fail if user is already registered', async () => {
    const savedDummy = new User({
      firstName: 'Blen',
      lastName: 'Feruz',
      phoneNumber: '+251976775645',
      password: 'abAd3303jDfj1!!!'
    })
    await savedDummy.save()
    const response = await request(app)
      .post('/api/v1/auth/signup-with-phone')
      .send(validDummy)
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('User is already registerd')
  })
})
