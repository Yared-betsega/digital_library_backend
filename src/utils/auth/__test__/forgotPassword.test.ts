import { app } from '../../../server'
import supertest from 'supertest'
import { setUp, dropCollections, dropDatabase } from '../../db/connect'
import { User } from '../../../resources/user/user.model'
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
