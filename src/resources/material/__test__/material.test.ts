import { Book } from '../../book/book.model'
import { User } from '../../user/user.model'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'
import { Material } from '../material.model'
import supertest from 'supertest'
import { app } from '../../../server'
import { connect } from '../../../utils/db/setupDB'
const bookData = new Book({
  link: 'https://my-sample-book.com'
})
const bookData2 = new Book({
  link: 'https://my-sample2-book.com'
})
const userData = new User({
  email: 'fitsumabyu@gmail.com',
  password: 'fitsumabyupass',
  firstName: 'Fitsum',
  middleName: 'Abyu',
  lastName: 'Engida',
  bio: 'I am a G31 A2SVian',
  educationPlace: 'Addis Ababa'
})

const userData2 = new User({
  email: 'feruzblen@gmail.com',
  password: 'fitsumabyupass',
  firstName: 'test',
  middleName: 'tester',
  lastName: 'test',
  bio: 'this my test account',
  educationPlace: 'Addis Ababa'
})
beforeAll(async () => {
  await setUp()
})
beforeEach(async () => {
  const sampleBook = await Book.insertMany([bookData, bookData2])
  const id2 = sampleBook[1]._id
  const id = sampleBook[0]._id

  const sampleUser2 = await User.insertMany([userData, userData2])
  const u_id2 = sampleUser2[1]._id
  const u_id = sampleUser2[0]._id

  const materialData2 = new Material({
    levelOfEducation: 'University',
    materialType: 'Book',
    typeId: id2,
    viewCount: 5,
    course: 'test course',
    title: 'some course',
    thumbnail: 'some picture',
    department: 'some place',
    tags: 'exam',
    upvoteCount: 2,
    description: 'good suggestion',
    user: u_id2,
    type: 'Book'
  })
  const materialData = new Material({
    levelOfEducation: 'University',
    materialType: 'Book',
    typeId: id,
    viewCount: 5,
    course: 'test course',
    title: 'some course',
    thumbnail: 'some picture',
    department: 'some place',
    tags: 'exam',
    upvoteCount: 4,
    description: 'good suggestion',
    user: u_id,
    type: 'Book'
  })

  const sampleMaterial2 = await Material.insertMany([
    materialData2,
    materialData
  ])
})
afterEach(async () => {
  await dropCollections()
})
afterAll(async () => {
  await dropDatabase()
})
describe('Post api/v1/material/popular', () => {
  it('should return data with userId and typeId populated', async () => {
    const res = await supertest(app)
      .get('/api/v1/material/popular/?limit=1&skip=1')
      .expect(200)
    expect(res.body.data.materials).not.toBeNull()
    expect(res.body.data.materials[0].user.firstName).toBe(userData.firstName)
    expect(res.body.data.materials[0].typeId.link).toBe(bookData.link)
    expect(res.body.data.materials.length).toBe(1)
  })
  it('should return 400 if pagination is invalid', async () => {
    // console.log('second test')
    const res = await supertest(app)
      .get('/api/v1/material/popular/?limit=20&skip=4')
      .expect(400)

    expect(res.body.message).toBe('no data found')
  })
})
