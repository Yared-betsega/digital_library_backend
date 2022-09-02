import { Material } from '../material.model'
import mongoose, { Schema } from 'mongoose'
import { setUp, dropDatabase, dropCollections } from '../../../utils/db/connect'

const userData1 = {
  levelOfEducation: 'University',
  user: new mongoose.Types.ObjectId(),
  department: 'ElectricalEngineering',
  title: 'oop',
  upvoteCount: 20,
  type: 'Book',
  typeId: new mongoose.Types.ObjectId(),
  viewCount: 2,
  course: 'test course',
  year: 2
}
const userData2 = {
  levelOfEducation: 'Wrong',
  materialType: 'Book',
  typeId: new mongoose.Types.ObjectId(),
  viewCount: 2,
  course: 'test course'
}

const userData3 = {
  levelOfEducation: 'University',
  materialType: 'Book',
  typeId: new mongoose.Types.ObjectId(),
  viewCount: 2,
  course: 'test course'
}
const userData4 = {
  levelOfEducation: 'University',
  materialType: 'Book',
  typeId: 23,
  viewCount: 2,
  course: 'test course'
}
const userData5 = {
  levelOfEducation: 'University',
  materialType: 'Book',
  typeId: new mongoose.Types.ObjectId(),
  viewCount: 'hi',
  course: 'test course'
}
const userData6 = {
  levelOfEducation: 'University',
  user: new mongoose.Types.ObjectId(),
  department: 'ElectricalEngineering',
  title: 'oop',
  upvoteCount: 20,
  type: 'Book',
  typeId: new mongoose.Types.ObjectId(),
  viewCount: 2,
  year: 3
}

const userData7 = {
  user: new mongoose.Types.ObjectId(),
  department: 'ElectricalEngineering',
  title: 'oop',
  upvoteCount: 20,
  type: 'Book',
  typeId: new mongoose.Types.ObjectId(),
  viewCount: 2,
  year: 4
}

describe('Material Model', () => {
  beforeAll(async () => {
    await setUp()
  }, 30000)

  afterEach(async () => {
    await dropCollections()
  }, 30000)

  afterAll(async () => {
    await dropDatabase()
  }, 30000)

  describe('Schema structure testing', () => {
    it('should return the schema of levelOfEducation', async () => {
      const levelOfEducation = Material.schema.obj.levelOfEducation
      expect(levelOfEducation).toEqual({
        type: String,
        enum: ['University', 'Highschool'],
        default: 'University',
        required: true
      })
    })
    it('should return the schema of materialType', async () => {
      const materialType = Material.schema.obj.type
      expect(materialType).toEqual({
        type: String,
        enum: ['Book', 'Video', 'Notes', 'Quiz'],
        required: true
      })
    })
    it('should return the schema of typeId', async () => {
      const typeId = Material.schema.obj.typeId
      expect(typeId).toEqual({
        refPath: 'type',
        type: Schema.Types.ObjectId,
        required: true
      })
    })
    it('should return the schema of viewCount', async () => {
      const viewCount = Material.schema.obj.viewCount
      expect(viewCount).toEqual({
        type: Number,
        default: 0
      })
    })
    it('should return the schema of course', async () => {
      const course = Material.schema.obj.course
      expect(course).toEqual({
        type: String,
        required: false
      })
    })
  }),
    describe('Valid input testing', () => {
      it('should return a valid Material model', async () => {
        const materialPrototype = userData1
        const material = await Material.create(materialPrototype)
        expect(material).toMatchObject(materialPrototype)
      })
      it('should return an error, given an invalid levelOfEducation field', async () => {
        const materialPrototype = userData2
        let err: any
        const material = await Material.create(materialPrototype).catch(
          (error) => {
            err = error
          }
        )
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
        expect(err.errors.levelOfEducation).toBeDefined()
      })
      it('should return an error, given an invalid materialType field', async () => {
        const materialPrototype = userData3
        let err: any
        const material = await Material.create(materialPrototype).catch(
          (error) => {
            err = error
          }
        )
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
        expect(err.errors.type).toBeDefined()
      })
      it('should return an error, given an invalid typeId field', async () => {
        const materialPrototype = userData4
        let err: any
        const material = await Material.create(materialPrototype).catch(
          (error) => {
            err = error
          }
        )
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
        expect(err.errors.typeId).toBeDefined()
      })
      it('should return an error, given an invalid viewCount field', async () => {
        const materialPrototype = userData5
        let err: any
        const material = await Material.create(materialPrototype).catch(
          (error) => {
            err = error
          }
        )
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
        expect(err.errors.viewCount).toBeDefined()
      })
      it('should not return an error, given that the course field is missing', async () => {
        const materialPrototype = userData6
        let err: any
        const material = await Material.create(materialPrototype).catch(
          (error) => {
            err = error
          }
        )
        expect(err).toBeUndefined()
      })

      it('the default value for levelOfEducation should be University', async () => {
        const materialPrototype = userData7
        const material = await Material.create(materialPrototype)
        expect(material.levelOfEducation).toBe('University')
      })
    })
})
