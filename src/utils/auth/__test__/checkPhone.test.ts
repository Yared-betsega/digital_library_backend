import request from 'supertest'
import { User } from '../../../resources/user/user.model'
import { app } from '../../../server'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'
const user1 = {
  email: 'fitsumabyu@gmail.com',
  password: 'fitsumpass',
  phoneNumber: '+251934568990',
  firstName: 'Fitsum',
  middleName: 'Abyu',
  lastName: 'Engida'
}

beforeAll(async () => {
  await setUp()
}, 30000)

afterEach(async () => {
  await dropCollections()
}, 30000)

afterAll(async () => {
  await dropDatabase()
}, 30000)

describe('Checkif phone exists', () => {
  it('should return a status 400 since phone exists', async () => {
    const validUser = await User.create(user1)

    const result = await request(app).get('/api/v1/auth/checkPhone').send({
      phoneNumber: '+251934568990'
    })

    expect(result.status).toBe(400)
  })
  it('should return a status 200 since phonenumber doesnot exists', async () => {
    const validUser = await User.create(user1)

    const result = await request(app).get('/api/v1/auth/checkPhone').send({
      phoneNumber: '+251934560000'
    })

    expect(result.status).toBe(200)
  })
})
