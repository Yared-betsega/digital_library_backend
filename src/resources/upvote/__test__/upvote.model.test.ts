import { Upvote } from '../upvote.model'
import mongoose from 'mongoose'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'

const user = new mongoose.Types.ObjectId()
const material = new mongoose.Types.ObjectId()

const case1 = {
  userId: user,
  materialId: material
}

// required properties are absent
const case2 = {
  userId: user
}

//required properties are absent
const case3 = {
  materialId: material
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
  it('should create & save upvote successfully', async () => {
    const validupVote = await Upvote.create(case1)
    expect(validupVote._id).toBeDefined()
    expect(validupVote.userId).toBe(user)
    expect(validupVote.materialId).toBe(material)
  })
  it('should return an error because materialId is reqired', async () => {
    let err: any

    try {
      await Upvote.create(case2)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })

  it('should return an error because userId is required', async () => {
    let err: any

    try {
      await Upvote.create(case3)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })
})
