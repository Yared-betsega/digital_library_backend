import mongoose, { Error } from 'mongoose'
import { Comment } from '../comment.model'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'

describe('Comment Model', () => {
  beforeAll(async () => {
    await setUp()
  }, 30000)

  afterEach(async () => {
    await dropCollections()
  }, 30000)

  afterAll(async () => {
    await dropDatabase()
  }, 30000)

  describe('Schema', () => {
    test('userId', () => {
      const userId = Comment.schema.obj.userId
      expect(userId).toEqual({
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
      })
    })
    test('materialId', () => {
      const userId = Comment.schema.obj.materialId
      expect(userId).toEqual({
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Material'
      })
    })
    test('content', () => {
      const content = Comment.schema.obj.content
      expect(content).toEqual({
        type: String,
        maxLength: 500,
        minLength: 1,
        required: true
      })
    })
    test('creating comment with out required fields should fail', async () => {
      let err
      try {
        const invalidComment = await Comment.create({
          userId: new mongoose.Types.ObjectId(),
          content: 'I love this resourse'
        })
      } catch (error) {
        err = error
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    })
    test('creating comment with invalid content should fail', async () => {
      let err

      try {
        const invalidComment = await Comment.create({
          userId: new mongoose.Types.ObjectId(),
          materialId: new mongoose.Types.ObjectId()
        })
      } catch (error) {
        err = error
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    })
  })
})
