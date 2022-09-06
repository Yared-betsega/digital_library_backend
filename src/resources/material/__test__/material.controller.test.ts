import supertest from 'supertest'
import { setUp, dropCollections, dropDatabase } from '../../../utils/db/connect'
import { Material } from '../../material/material.model'
import mongoose from 'mongoose'
import JWT from 'jsonwebtoken'
import { User } from '../../../resources/user/user.model'
import request from 'supertest'
import { app } from '../../../server'
import { isEmpty } from 'lodash'

beforeAll(async () => {
  await setUp()
}, 30000)

afterEach(async () => {
  await dropCollections()
}, 30000)

afterAll(async () => {
  await dropDatabase()
}, 30000)

const user1 = {
  email: 'fitsumabyu@gmail.com',
  password: 'fitsumabyupass',
  firstName: 'Fitsum',
  middleName: 'Abyu',
  lastName: 'Engida',
  bio: 'I am a G31 A2SVian',
  educationPlace: 'Addis Ababa'
}

let user: any
let token: any

describe('upload material', () => {
  beforeAll(async () => {
    await setUp()
  }, 10000)

  beforeEach(async () => {
    await dropCollections()
    try {
      user = await User.create(user1)
    } catch (err) {
      console.log(err)
    }
    token = JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)
  }, 10000)

  afterAll(async () => {
    await dropDatabase()
  }, 10000)
  describe('Book upload test', () => {
    it('should return status code 400 no file is sent', async () => {
      const response = await supertest(app)
        .post('/api/v1/material/book')
        .send({
          title: 'Software',
          type: 'Book',
          upvoteCount: 5,
          levelOfEducation: 'University',
          materialType: 'Book',
          typeId: 'abcd',
          viewCount: 134,
          course: 'Deep learning',
          department: 'AI',
          tags: ['Python']
        })

      expect(response.body.statusCode).toBe(401)
      expect(response.body.message).toBe('Access Denied')
    })

    it('should return status code 400 no file is sent', async () => {
      const response = await supertest(app)
        .post('/api/v1/material/book')
        .send({
          title: 'Software',
          type: 'Book',
          upvoteCount: 5,
          levelOfEducation: 'University',
          materialType: 'Book',
          typeId: 'abcd',
          viewCount: 134,
          course: 'Deep learning',
          department: 'AI',
          tags: ['Python']
        })
        .set('authorization', `Bearer ${token}`)
      expect(response.body.statusCode).toBe(400)
      expect(response.body.message).toBe('Please upload book')
    })
    it('should return status code 400 when one field is missing', async () => {
      const response = await supertest(app)
        .post('/api/v1/material/book')
        .field('type', 'Book')
        .field('title', 'knapsack')
        .field('levelOfEducation', 'University')
        .field('course', 'AI')
        .attach('book', 'src/resources/material/testFiles/knapsack.pdf')
        .set('authorization', `Bearer ${token}`)

      expect(response.body.statusCode).toBe(400)
    })
    it('should return status code 201 on successful creation', async () => {
      const response = await supertest(app)
        .post('/api/v1/material/book')
        .field('type', 'Book')
        .field('title', 'knapsack')
        .field('department', 'SoftwareEngineering')
        .field('levelOfEducation', 'University')
        .field('course', 'AI')
        .field('year', '1')
        .field('tags', ['Python'])
        .attach('book', 'src/resources/material/testFiles/knapsack.pdf')
        .set('authorization', `Bearer ${token}`)
      expect(response.body.statusCode).toBe(201)
    })
  })
  describe('Video upload test', () => {
    it('should return a statusCode of 201, and the video material if all the fields are valid', async () => {
      const video = {
        link: 'https://www.youtube.com/watch?v=_hALYHcjCLI',
        tags: [
          'University',
          'Software Enginnering',
          'Applied Math III',
          'Applied Math 3',
          'applied math',
          'SiTE',
          'semester 2',
          'year 2'
        ],
        title: 'Applied Mathematics III chapter 1 part 1',
        department: 'SoftwareEngineering',
        type: 'Video',
        year: 2,
        description: '',
        course: 'Mathematics'
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/material/video')
        .set('authorization', `Bearer ${token}`)
        .send(video)
      expect(body.statusCode).toBe(201)
      expect(body.data).toBeDefined()
      expect(body.message).toBeUndefined()
    })
    it('should return a statusCode of 400, and a message if all the atleast one field is invalid', async () => {
      const invalidVideo = {
        link: 'https://www.youtube.com/watch?v=_hALYHcjCLI',
        title: 'Applied Mathematics III chapter 1 part 1',
        department: 'SoftwareEngineering',
        type: 'Video',
        course: 'Mathematics',
        description: ''
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/material/video')
        .set('authorization', `Bearer ${token}`)
        .send(invalidVideo)
      expect(body.statusCode).toBe(400)
      expect(body.message).toBeDefined()
      expect(body.data).toBeUndefined()
    })
    it('should return a statusCode of 400, and a message if all the link field is missing', async () => {
      const video = {
        tags: [
          'University',
          'Software Enginnering',
          'Applied Math III',
          'Applied Math 3',
          'applied math',
          'SiTE',
          'semester 2',
          'year 2'
        ],
        title: 'Applied Mathematics III chapter 1 part 1',
        department: 'SoftwareEngineering',
        type: 'Video',
        year: 2,
        course: 'Mathematics',
        description: ''
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/material/video')
        .set('authorization', `Bearer ${token}`)
        .send(video)
      expect(body.statusCode).toBe(400)
      expect(body.message).toBeDefined()
      expect(body.data).toBeUndefined()
    })
  })
  describe('Quiz upload test', () => {
    it('should return a statusCode of 201, and the Quiz material if all the fields are valid', async () => {
      const quiz = {
        title: 'New quiz',
        department: 'SoftwareEngineering',
        year: 1,
        course: 'Mathematics',
        tags: ['2014', '2022', 'Physics'],
        type: 'Quiz',
        duration: 90,
        numberOfQuestions: 3,
        instruction: 'Choose the best answer',
        questions: [
          {
            text: 'solve the following first quesion',
            answerIndex: 2,
            index: 1,
            choices: [
              {
                index: 0,
                text: 'Choice A'
              },
              {
                index: 1,
                text: 'Choice B'
              },
              {
                index: 2,
                text: 'Choice C'
              },
              {
                index: 3,
                text: 'Choice D'
              }
            ]
          },
          {
            text: 'solve the following second quesion',
            answerIndex: 1,
            index: 2,
            choices: [
              {
                index: 0,
                text: 'Choice A'
              },
              {
                index: 1,
                text: 'Choice B'
              },
              {
                index: 2,
                text: 'Choice C'
              },
              {
                index: 3,
                text: 'Choice D'
              }
            ]
          },
          {
            text: 'solve the following third quesion',
            answerIndex: 0,
            index: 3,
            choices: [
              {
                index: 0,
                text: 'Choice A'
              },
              {
                index: 1,
                text: 'Choice B'
              },
              {
                index: 2,
                text: 'Choice C'
              },
              {
                index: 3,
                text: 'Choice D'
              }
            ]
          }
        ]
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/material/quiz')
        .set('authorization', `Bearer ${token}`)
        .send(quiz)
      expect(body.statusCode).toBe(201)
      expect(body.data).toBeDefined()
      expect(body.message).toBeUndefined()
    })
    it('should return a statusCode of 400, and a message if the tag field is missing', async () => {
      const quiz = {
        title: 'New quiz',
        department: 'SoftwareEngineering',
        year: 1,
        course: 'Mathematics',
        type: 'Quiz',
        duration: 90,
        numberOfQuestions: 3,
        instruction: 'Choose the best answer',
        questions: [
          {
            text: 'solve the following first quesion',
            answerIndex: 2,
            index: 1,
            choices: [
              {
                index: 0,
                text: 'Choice A'
              },
              {
                index: 1,
                text: 'Choice B'
              },
              {
                index: 2,
                text: 'Choice C'
              },
              {
                index: 3,
                text: 'Choice D'
              }
            ]
          },
          {
            text: 'solve the following second quesion',
            answerIndex: 1,
            index: 2,
            choices: [
              {
                index: 0,
                text: 'Choice A'
              },
              {
                index: 1,
                text: 'Choice B'
              },
              {
                index: 2,
                text: 'Choice C'
              },
              {
                index: 3,
                text: 'Choice D'
              }
            ]
          },
          {
            text: 'solve the following third quesion',
            answerIndex: 0,
            index: 3,
            choices: [
              {
                index: 0,
                text: 'Choice A'
              },
              {
                index: 1,
                text: 'Choice B'
              },
              {
                index: 2,
                text: 'Choice C'
              },
              {
                index: 3,
                text: 'Choice D'
              }
            ]
          }
        ]
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/material/quiz')
        .set('authorization', `Bearer ${token}`)
        .send(quiz)
      expect(body.statusCode).toBe(400)
      expect(body.data).toBeUndefined()
      expect(body.message).toBeDefined()
    })
    it('should return a statusCode of 400, and a message if all the question field is missing', async () => {
      const quiz = {
        title: 'New quiz',
        department: 'SoftwareEngineering',
        year: 1,
        course: 'Mathematics',
        tags: ['2014', '2022', 'Physics'],
        type: 'Quiz',
        duration: 90,
        numberOfQuestions: 3,
        instruction: 'Choose the best answer'
      }
      const { statusCode, body } = await supertest(app)
        .post('/api/v1/material/quiz')
        .set('authorization', `Bearer ${token}`)
        .send(quiz)
      expect(body.statusCode).toBe(400)
      expect(body.data).toBeUndefined()
      expect(body.message).toBeDefined()
    })
  })
})

const user1 = {
  email: 'eyosiasbitsu@gmail.com',
  password: 'qwertyuiop1234567890+',
  firstName: 'Fitsum',
  middleName: 'Abyu',
  lastName: 'Engida',
  bio: 'electrical engineer',
  educationPlace: 'Addis Ababa'
}

describe('testing for the search controller', () => {
  it('Should return the materials based on the keyword', async () => {
    const user = await User.create(user1)

    const token = JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)

    const material1 = await Material.create({
      title: 'Electrical',
      type: 'Video',
      year: 2,
      typeId: mongoose.Types.ObjectId.generate(),
      user: user._id,
      levelOfEducation: 'University',
      course: 'OOP',
      department: 'ElectricalEngineering'
    })

    const material2 = await Material.create({
      title: 'Electrical',
      type: 'Book',
      year: 2,
      typeId: mongoose.Types.ObjectId.generate(),
      user: user._id,
      levelOfEducation: 'University',
      course: 'Electromagnetic Fields',
      department: 'ElectricalEngineering'
    })

    expect(material1).not.toBeUndefined()
    expect(material2).not.toBeUndefined()
    expect(material1.title).toEqual('Electrical')
    expect(material2.title).toEqual('Electrical')

    const materials = await supertest(app)
      .get(`/api/v1/material/search`)
      .set('authorization', 'Bearer ' + token)
      .query({
        keyword: 'Electrical'
      })

    expect(materials.body.data.materials).not.toBe(isEmpty)
    expect(materials.body.data.materials).not.toBeUndefined()
  })

  it('Should return an empty list because the key word does not exist', async () => {
    const user = await User.create(user1)

    const token = JWT.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET)

    const material1 = await Material.create({
      title: 'Electrical',
      type: 'Video',
      year: 2,
      typeId: mongoose.Types.ObjectId.generate(),
      user: user._id,
      levelOfEducation: 'University',
      course: 'OOP',
      department: 'ElectricalEngineering'
    })

    const material2 = await Material.create({
      title: 'Electrical',
      type: 'Book',
      year: 2,
      typeId: mongoose.Types.ObjectId.generate(),
      user: user._id,
      levelOfEducation: 'University',
      course: 'Electromagnetic Fields',
      department: 'ElectricalEngineering'
    })

    expect(material1).not.toBeUndefined()
    expect(material2).not.toBeUndefined()
    expect(material1.title).toEqual('Electrical')
    expect(material2.title).toEqual('Electrical')

    const materials = await supertest(app)
      .get(`/api/v1/material/search`)
      .set('authorization', 'Bearer ' + token)
      .query({
        keyword: 'Software'
      })

    expect(materials.body.data.materials).toStrictEqual([])
  })
})
