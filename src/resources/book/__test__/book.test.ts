import mongoose from 'mongoose'
import { Book } from '../book.model'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'
const bookData = {
  link: 'https://my-sample-book.com'
}

beforeAll(async () => {
  await setUp()
})
afterEach(async () => {
  await dropCollections()
})
afterAll(async () => {
  await dropDatabase()
})
describe('book model', () => {
  test('book schema', () => {
    const model = Book.schema.obj
    expect(model).toEqual({
      link: {
        type: String,
        required: true
      }
    })
  })
  test('create and save new book', async () => {
    const newValidBook = new Book(bookData)
    const savedValidBook = await newValidBook.save()

    expect(savedValidBook._id).not.toBeNull()
    expect(savedValidBook.link).toEqual(bookData.link)
  })
  test('if required fields are not given it should fail', async () => {
    const newInvalidBook = new Book({})
    let err
    try {
      const invalidBookError = await newInvalidBook.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
  })
})
