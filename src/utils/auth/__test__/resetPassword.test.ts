import { app } from '../../../server'
import supertest from 'supertest'
import { setUp, dropCollections, dropDatabase } from '../../db/connect'
import { User } from '../../../resources/user/user.model'
import { OTP } from '../../../resources/OTP/otp.model'
import { generateOTP } from '../../../helpers/otp'
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
    email: 'testEmail2@gmail.com',
    firstName: 'testt',
    lastName: 'father name',
    password: '82482asf:'
  })
}, 3000)

afterAll(async () => {
  await dropCollections()
  await dropDatabase()
}, 3000)

describe('Reset password Test', () => {
  it('return status code 404 if a user with the give email does not exist', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/resetPassword')
      .send({
        email: 'NonExistentUser@gmail.com'
      })
      .expect(404)
    expect(response.body.message).toBe('User not found!')
  })
  it('return status code 400 if OTP is not provided or no OTP was sent before', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/resetPassword')
      .send({
        email: 'testEmail@gmail.com',
        newPassword: '74312341234!'
      })
      .expect(400)
    expect(response.body.message).toBe('Cannot Change Password')
  })
  it('return status code 403 if if provided OTP is not the same as the sent one!', async () => {
    const otp = await OTP.create({
      email: 'testEmail@gmail.com',
      otp: generateOTP(6)
    })
    const response = await supertest(app)
      .post('/api/v1/auth/resetPassword')
      .send({
        email: 'testEmail@gmail.com',
        newPassword: '74312341234!',
        otp: '265430'
      })
      .expect(403)
    expect(response.body.message).toBe('You are forbidden to do the changes')
  })
  it('return status code 200 if Password Successfully changed!', async () => {
    const otp = await OTP.create({
      email: 'testEmail2@gmail.com',
      otpCode: generateOTP(6)
    })
    const response = await supertest(app)
      .post('/api/v1/auth/resetPassword')
      .send({
        email: 'testEmail2@gmail.com',
        newPassword: '7431ac41234!',
        otp: otp.otpCode
      })
      .expect(200)
    expect(response.body.message).toBe('Password Successfully changed!')
  })
})
