import supertest from 'supertest'
import { setUp, dropCollections, dropDatabase } from '../../../utils/db/connect'
import { User } from '../../user/user.model'
import { Material } from '../../material/material.model'
import { app } from '../../../server'
import mongoose from 'mongoose'
import JWT from 'jsonwebtoken'
describe('Upvote controller testing', () => {
  beforeAll(async () => {
    await setUp()
  })
  afterEach(async () => {
    await dropCollections()
  })
  afterAll(async () => {
    await dropDatabase()
  })
  describe('Upvote testing', () => {
    it('Should increase the view count or retract the view count', async () => {
      const user = await User.create({
        email: 'sefineh@gmail.com',
        password: 'Sefineh!1234',
        firstName: 'Sefineh',
        middleName: 'Tesfa',
        lastName: 'Bekele',
        bio: 'I am a software developer',
        educationPlace: 'Addis Ababa'
      })

      const token = JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)
      const material = await Material.create({
        title: 'Software',
        type: 'Book',
        year: 2,
        typeId: mongoose.Types.ObjectId.generate(),
        upvoteCount: 5,
        user: user._id,
        levelOfEducation: 'University',
        viewCount: 5,
        course: 'Web development',
        department: 'SoftwareEngineering'
      })
      expect(material).not.toBeUndefined()
      expect(material.department).toEqual('SoftwareEngineering')
      const upvote = await supertest(app)
        .post(`/api/v1/upvote/${material._id}`)
        .set('authorization', 'Bearer ' + token)
      expect(upvote.body.data.upvoteCount).toEqual(1)
      expect(upvote.body.data.upvoteCount).not.toEqual(0)
      const favorite = await supertest(app)
        .get('/api/v1/user/myFavorites')
        .set('authorization', 'Bearer ' + token)
      const _id = new mongoose.Types.ObjectId(
        favorite.body.data[0].upVotes[0].materialId._id
      )
      expect(_id).toEqual(material._id)
      const retract = await supertest(app)
        .post(`/api/v1/upvote/${material._id}`)
        .set('authorization', 'Bearer ' + token)
      expect(retract.body.data.upvoteCount).toEqual(0)
      expect(retract.body.data.upvoteCount).not.toEqual(1)
      const favorite2 = await supertest(app)
        .get('/api/v1/user/myFavorites')
        .set('authorization', 'Bearer ' + token)
      //After retracted the vote
      expect(favorite2.body.data.upVotes).toBeUndefined()
    })
  })
})
