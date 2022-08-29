import { app } from '../../../server'
import supertest from 'supertest'
import { setUp, dropCollections, dropDatabase } from '../../db/connect'
import { User } from '../../../resources/user/user.model'
let mongoServer: any
jest.setTimeout(10000)
let user1: any
let user2: any
let user3: any
const options = ['no_account', 'already_verified', 'not_verified']

describe('isUserRegisterd Test', () => {
  beforeAll(async () => {
    await setUp()
    user1 = await User.create({
      email: 'testEmail@gmail.com',
      firstName: 'testt',
      lastName: 'father name',
      password: '82482asf:',
      isVerified: true
    })
    user2 = await User.create({
      email: 'testEmail2@gmail.com',
      firstName: 'testt',
      lastName: 'father name',
      password: '82482asf:'
    })
    user3 = await User.create({
      phoneNumber: '+251973835632',
      firstName: 'testt',
      lastName: 'father name',
      password: '82482asf:',
      isVerified: true
    })
  })

  afterAll(async () => {
    await dropCollections()
    await dropDatabase()
  })
  it('return status code 200 if the user with the given email is registered', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth//isUserRegistered')
      .send({
        email: user1.email
      })
    expect(response.statusCode).toBe(200)
    expect(response.body.data.accountStatus).toBe(options[1])
  })
  it('return status code 400 if the user with the given email is not verified', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth//isUserRegistered')
      .send({
        email: user2.email
      })
    expect(response.statusCode).toBe(400)
    expect(response.body.data.accountStatus).toBe(options[2])
  })
  it('return status code 400 if there is no user with the given email', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth//isUserRegistered')
      .send({
        email: 'invalid email'
      })
    expect(response.statusCode).toBe(400)
    expect(response.body.data.accountStatus).toBe(options[0])
  })
  it('return status code 400 if the email field is missing in the request body', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth//isUserRegistered')
      .send({})
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBeDefined()
  })
})
