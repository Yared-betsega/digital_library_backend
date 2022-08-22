// import { dropCollections, dropDatabase, setUp } from '../../../utils/db/connect'
// import supertest from 'supertest'
// import { User } from '../user.model'
// import { app } from '../../../server'

// describe('End point testing', () => {
//   beforeAll(async () => {
//     await setUp()
//   }, 30000)

//   afterEach(async () => {
//     await dropCollections()
//   }, 30000)

//   afterAll(async () => {
//     await dropDatabase()
//   }, 30000)
//   describe('Update user', () => {
//     it('Should update the user data', async () => {
//       const userData = {
//         firstName: 'Sefineh',
//         middleName: 'Tesfa'
//       }
//       const user = await User.create({
//         email: 'yared@gmail.com',
//         password: 'password',
//         isVerified: true,
//         firstName: 'yared',
//         middleName: 'tsegaye',
//         lastName: 'Unknown'
//       })
//       const updatedUser = await supertest(app)
//         .put(`/api/v1/user/${user._id}`)
//         .send(userData)
//       expect(updatedUser.status).toBe(200)
//     })
//     it('Should fail to update ', async () => {
//       const userData = {
//         firstName: 'Sefineh',
//         middleName: 'Tesfa'
//       }
//       const user = await User.create({
//         email: 'yared@gmail.com',
//         phoneNumber: '0946457258',
//         password: 'password',
//         isVerified: true,
//         firstName: 'yared',
//         middleName: 'tsegaye',
//         lastName: 'Unknown'
//       })
//       const updatedUser = await supertest(app)
//         .put(`/api/v1/user/${user.email}`)
//         .send(userData)
//       expect(updatedUser.status).toBe(400)
//     })
//   })
// })
