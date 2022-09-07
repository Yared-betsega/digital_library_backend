import supertest from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import JWT from 'jsonwebtoken'
import { app } from '../../../server'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'
import { IUserInterface, User } from '../user.model'
import { getUserById } from '../user.controllers'
import { IMaterialInterface, Material } from '../../material/material.model'
import { Upvote } from '../../upvote/upvote.model'

const user1 = {
  email: 'fitsumabyu@gmail.com',
  password: 'fitsumabyupass',
  firstName: 'Fitsum',
  middleName: 'Abyu',
  lastName: 'Engida',
  bio: 'I am a G31 A2SVian',
  educationPlace: 'Addis Ababa',
  upVotes: []
}

const prototype = {
  email: user1.email,
  firstName: user1.firstName,
  middleName: user1.middleName,
  lastName: user1.lastName,
  bio: user1.bio,
  educationPlace: user1.educationPlace
}

let user: any
let token: any
let material: any
let upVote: any
beforeAll(async () => {
  await setUp()
})
beforeEach(async () => {
  await dropCollections()
  try {
    user = await User.create(user1)
    material = await Material.create({
      levelOfEducation: 'University',
      materialType: 'Book',
      typeId: new mongoose.Types.ObjectId(),
      viewCount: 5,
      course: 'test course',
      title: 'some course',
      thumbnail: 'some picture',
      department: 'SoftwareEngineering',
      tags: 'exam',
      upvoteCount: 2,
      description: 'good suggestion',
      user: user.id,
      type: 'Book',
      year: 2
    })
    upVote = await Upvote.create({
      userId: user._id,
      materialId: material._id
    })
    user.upVotes.push(upVote._id)
    await user.save()
  } catch (err) {
    console.log(err)
  }
  token = JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)
})
afterAll(async () => {
  await dropDatabase()
})
describe('Comment controller test', () => {
  describe(' getUserById controller test', () => {
    it('should return a 200 statusCode, and the user given valid inputs', async () => {
      const { statusCode, body } = await supertest(app).get(
        `/api/v1/user/id/${user._id}`
      )

      expect(statusCode).toBe(200)
      expect(body.data).toMatchObject(prototype)
    })
    it('should return a 400 statusCode, given an invalid userId', async () => {
      const { statusCode, body } = await supertest(app).get(
        `/api/v1/user/id/${new mongoose.Types.ObjectId()}`
      )
      expect(statusCode).toBe(400)
      expect(body.message).toBeDefined()
    })
    it('should return a 400 statusCode, given an invalid userId', async () => {
      const { statusCode, body } = await supertest(app).get(
        `/api/v1/user/id/invalidId`
      )
      expect(statusCode).toBe(400)
      expect(body.message).toBeDefined()
    })
  })
  describe('myFavorites', () => {
    it('should return user favorites with statusCode 200', async () => {
      const result = await supertest(app)
        .get('/api/v1/user/myFavorites')
        .set({ authorization: `Bearer ${token}` })
        .expect(200)
      expect(result.body.data).not.toBeNull()
      expect(Object.keys(result.body.data).length).toBe(1)
    })
  })
})
