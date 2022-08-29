import { app } from '../../../server'
import supertest from 'supertest'
import { setUp, dropCollections, dropDatabase } from '../../../utils/db/connect'
import { User } from '../../../resources/user/user.model'
import { getAuth } from 'firebase-admin/auth'
import { Material } from '../material.model'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
jest.setTimeout(10000)

describe('Material recommender Test', () => {
  beforeAll(async () => {
    await setUp()
  }, 3000)
  afterAll(async () => {
    await dropDatabase()
  }, 3000)
  afterEach(async () => {
    await dropCollections()
  })

  it('Should return the materials with the user department else fetch random materials', async () => {
    const _id = new mongoose.Types.ObjectId()
    const password = '@1newpassword'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      email: 'testEmail@gmail.com',
      firstName: 'firstName',
      lastName: 'lastName',
      password: hashedPassword,
      educationFieldOfStudy: 'AI'
    })
    const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Data science',
      department: 'AI'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Web development',
      department: 'Software engineering'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Deep learning',
      department: 'AI'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Data science',
      department: 'AI'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Web development',
      department: 'Software engineering'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Deep learning',
      department: 'AI'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Data science',
      department: 'AI'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Web development',
      department: 'Software engineering'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Deep learning',
      department: 'AI'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Data science',
      department: 'AI'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Web development',
      department: 'Software engineering'
    })
    await Material.create({
      title: 'Software',
      type: 'Book',
      upvoteCount: 5,
      user: user._id,
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: _id,
      viewCount: 134,
      course: 'Deep learning',
      department: 'AI'
    })
    const response = await supertest(app)
      .post('/api/v1/material/recommend')
      .set({ authorization: `Bearer ${token}` })
      .send()
      .expect(200)
    expect(response.body.data.length).toBeLessThanOrEqual(10)
  })
})
