import { Request, Response, NextFunction } from 'express'
import { Course } from '../course/course.model'
export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { department } = req.query
    if (!department) {
      res.locals.json = {
        statusCode: 400,
        message: 'Department not provided'
      }
      return next()
    }

    const response = {}
    for (let i = 1; i <= 5; i++) {
      response[i] = []
      const courses = await Course.find({
        department: department,
        year: i
      }).select('courseName')
      response[i].push(courses)
    }

    res.locals.json = {
      statusCode: 200,
      data: response
    }

    return next()
  } catch (error) {
    console.log(error)
    res.locals.json = {
      statusCode: 400,
      message: "couldn't fetch comments"
    }
    return next()
  }
}

export const addCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { department, courseName, year } = req.body
    if (!department || !courseName || !year) {
      res.locals.json = {
        statusCode: 400,
        message: 'invalid input'
      }
      return next()
    }
    const course = await Course.create({
      department,
      courseName,
      year: Number(year)
    })

    res.locals.json = {
      statusCode: 200,
      data: course
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 500,
      message: error.message
    }
    return next()
  }
}
