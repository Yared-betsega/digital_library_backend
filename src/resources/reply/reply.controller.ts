import mongoose, { isValidObjectId } from 'mongoose'
import { Reply } from './reply.model'
import { toInteger } from 'lodash'
import { Comment } from '../comment/comment.model'
import { User } from '../user/user.model'
import { Request, Response, NextFunction } from 'express'
export const getAll = async (req, res, next) => {
  let limit = toInteger(req.query.limit) || 10
  let skip = toInteger(req.query.skip) || 1
  const result = await Reply.find()
    .sort({ postDated: 'desc' })
    .populate([
      {
        path: 'userId',
        select: 'firstName lastName phoneNumber email photoURL'
      }
    ])
  const estimate = await Reply.find({}).count()
  res.locals.json = {
    statusCode: 200,
    data: result,
    hasNext: Math.ceil(estimate / limit) >= skip + 1
  }
  return next()
}
export const getReply = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
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
      .sort({ postDate: 'desc' })
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
    comment.numberOfReplies = comment.numberOfReplies + 1
    await comment.save()

    res.locals.json = {
      statusCode: 201,
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

export async function updateReply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { _id } = res.locals
  const user = await User.findById(_id)
  if (!user) {
    res.locals.json = {
      statusCode: 400,
      message: 'User not found'
    }
    return next()
  }
  try {
    let reply: any
    if (!mongoose.isValidObjectId(req.body.id)) {
      res.locals.json = {
        statusCode: 400,
        message: 'Invalid ID'
      }
      return next()
    } else {
      reply = await Reply.findById(req.body.id)
      if (!reply) {
        res.locals.json = {
          statusCode: 400,
          message: 'reply not found'
        }
        return next()
      }
      if (reply.userId == _id) {
        const updatedReply = await Reply.updateOne(
          { _id: req.body.id },
          {
            $set: {
              content: req.body.content
            }
          }
        )
        res.locals.json = {
          statusCode: 200,
          message: 'reply successfully updated'
        }
        return next()
      } else {
        res.locals.json = {
          statusCode: 401,
          message: 'You are not allowed to edit this reply'
        }
        return next()
      }
    }
  } catch (err) {
    res.locals.json = {
      statusCode: 500,
      message: 'server failed'
    }
    return next()
  }
}
export async function deleteReply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { _id } = res.locals
    const replyId = new mongoose.Types.ObjectId(req.params.id)

    const reply = await Reply.findById(replyId)
    if (!reply) {
      res.locals.json = {
        statusCode: 404,
        message: 'comment not found'
      }
      return next()
    }
    if (reply.userId.toString() === _id) {
      const comment = await Comment.findById(reply.commentId)
      await reply.delete()
      comment.replies.splice(comment.replies.indexOf(replyId), 1)
      comment.numberOfReplies = comment.numberOfReplies - 1
      await comment.save()

      res.locals.json = {
        statusCode: 204,
        message: 'comment deleted successfully'
      }
      return next()
    }

    res.locals.json = {
      statusCode: 403,
      message: 'user not allowed'
    }
    return next()
  } catch (err) {
    res.locals.json = {
      statusCode: 500,
      message: 'server error'
    }
    return next()
  }
}
