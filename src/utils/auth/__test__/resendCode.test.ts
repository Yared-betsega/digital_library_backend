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
}, 3000)

afterAll(async () => {
  await dropCollections()
  await dropDatabase()
}, 3000)

describe('Resend verification code Test', () => {
  it('return status code 404 if an otp has not been sent before', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/resendCode')
      .send({
        email: 'NonExistentUser@gmail.com'
      })
      .expect(404)
    expect(response.body.message).toBe('User not registered')
  })

  it('return status code 200 if a new verification code has been sent', async () => {
    await OTP.create({
      email: 'testEmail@gmail.com',
      otpCode: generateOTP(6)
    })
    const response = await supertest(app)
      .post('/api/v1/auth/resendCode')
      .send({
        email: 'testEmail@gmail.com'
      })
      .expect(200)
    expect(response.body.message).toBe(
      'New email verification code sent successfully'
    )
  })
})
