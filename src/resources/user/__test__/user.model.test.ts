import mongoose from 'mongoose'
import { User } from '../user.model'

import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'

// normal test case
const user1 = {
  email: 'fitsumabyu@gmail.com',
  password: 'fitsumabyupass',
  firstName: 'Fitsum',
  middleName: 'Abyu',
  lastName: 'Engida',
  bio: 'I am a G31 A2SVian',
  educationPlace: 'Addis Ababa'
}

// length of password is less than it's supposed to
const user2 = {
  email: 'fitsumabyu@gmail.com',
  password: 'fit',
  firstName: 'Fitsum',
  lastName: 'Abyu'
}

//required fields are absent
const user3 = {
  email: 'fitsumabyu@gmail.com'
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

describe('User model', () => {
  it('should create & save user successfully', async () => {
    const validUser = await User.create(user1)
    const savedUser = await validUser.save()

    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedUser._id).toBeDefined()
    expect(savedUser.email).toBe(user1.email)
    expect(savedUser.password).toBe(user1.password)
    expect(savedUser.firstName).toBe(user1.firstName)
    expect(savedUser.middleName).toBe(user1.middleName)
    expect(savedUser.lastName).toBe(user1.lastName)
    expect(savedUser.bio).toBe(user1.bio)
    expect(savedUser.educationPlace).toBe(user1.educationPlace)
  })

  it('should return an error because firstName, lastName and password are reqired', async () => {
    let err: any
    try {
      const userWithMissingRequiredFields = await User.create(user3)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })

  it('should return an error because length of password is less than expected', async () => {
    let err: any
    try {
      const userWithInvalidPassword = await User.create(user2)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })
})
