import { app } from '../../../server'
import supertest from 'supertest'
import { setUp, dropCollections, dropDatabase } from '../../db/connect'
import { User } from '../../../resources/user/user.model'
import { getAuth } from 'firebase-admin/auth'
let mongoServer: any
jest.setTimeout(10000)
beforeAll(async () => {
  await setUp()
  const user = await User.create({
    email: 'testEmail@gmail.com',
    firstName: 'testt',
    lastName: 'father name',
    password: '82482asf:'
  })
  const user2 = await User.create({
    phoneNumber: '+251973835632',
    firstName: 'testt',
    lastName: 'father name',
    password: '82482asf:'
  })
}, 3000)
afterAll(async () => {
  await dropDatabase()
}, 3000)

describe('Forgot password Test', () => {
  it('return status code 404 if a user with the give email does not exist', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/forgotPassword')
      .send({
        email: 'NonExistentUser@gmail.com'
      })
      .expect(404)
    expect(response.body.message).toBe('User Not found')
  })

  it('return status code 200 if the link to changing password sent', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/forgotPassword')
      .send({
        email: 'testEmail@gmail.com'
      })
      .expect(200)
    expect(response.body.message).toBe(
      'A link to changing password sent to your email'
    )
  })
})
describe('Forgot password with phone Test', () => {
  it('return status code 400 if the phone number is not saved in our database', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/forgotPassword')
      .send({
        token: ' user firebase token',
        phoneNumber: '+251963845623'
      })
      .expect(404)
    expect(response.body.message).toBe('User Not found')
  })
  it('should fail if user is not verified', async () => {
    const toBeReturned: any = { error: "Couldn't verify user" }
    jest.spyOn(getAuth(), 'verifyIdToken').mockRejectedValue(toBeReturned)
    const response = await supertest(app)
      .post('/api/v1/auth/forgotPassword')
      .send({
        token: ' Invalid Token',
        phoneNumber: '+251973835632'
      })
    expect(response.status).toBe(400)
    expect(response.body.message).toStrictEqual(toBeReturned.error)
  })
  it('if user token is verified return the token', async () => {
    const toBeReturned: any = {}
    jest.spyOn(getAuth(), 'verifyIdToken').mockResolvedValue(toBeReturned)
    const response = await supertest(app)
      .post('/api/v1/auth/forgotPassword')
      .send({
        token: ' Valid Token',
        phoneNumber: '+251973835632'
      })

    expect(response.body.statusCode).toBe(200)
    expect(response.body.token).not.toBeNull()
  })
})
