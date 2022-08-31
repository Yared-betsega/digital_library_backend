import { isValidObjectId } from 'mongoose'
import { Reply } from './reply.model'
import { toInteger } from 'lodash'
import { Comment } from '../comment/comment.model'
import { User } from '../user/user.model'
import { Request, Response, NextFunction } from 'express'
export const getAll = async (req, res, next) => {
  const result = await Reply.find()

  res.locals.json = {
    statusCode: 200,
    data: result
  }
  return next()
}
export const getReply = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.locals.json = {
        statusCode: 400,
        message: 'Invalid ID'
      }

      return next()
    }

    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1
    const replies = await Reply.find({
      commentId: req.params.id
    })
      .populate([
        {
          path: 'userId',
          select: 'firstName lastName phoneNumber email photoURL'
        }
      ])
      .skip((skip - 1) * limit)
      .limit(limit)

    const estimate = await Reply.find({
      commentId: req.params.id
    }).count()

    if (!replies) {
      res.locals.json = {
        statusCode: 404,
        message: 'comment not found'
      }

      return next()
    }

    res.locals.json = {
      statusCode: 200,
      data: {
        replies: replies,
        hasNext: Math.ceil(estimate / limit) >= skip + 1
      }
    }

    return next()
  } catch (err) {
    console.log(err)
    res.locals.json = {
      statusCode: 500,
      message: 'Server failed'
    }
  }
}
export async function addReply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { _id } = res.locals
    const { commentId, content } = req.body
    const user = await User.findById(_id)
    const comment = await Comment.findById(commentId)

    if (!user || !comment) {
      res.locals.json = {
        statusCode: 400,
        message: 'invaild user or comment'
      }
      return next()
    }

    const reply = await Reply.create({
      userId: _id,
      commentId: commentId,
      content: content
    })

    if (!reply) {
      res.locals.json = {
        statusCode: 400,
        message: 'invalid reply'
      }
      return next()
    }

    comment.replies.push(reply._id)

    await comment.save()

    res.locals.json = {
      statusCode: 200,
      data: reply
    }
    return next()
  } catch (err) {
    res.locals.json = {
      statusCode: 400,
      message: err.message
    }
    return next()
  }
}
