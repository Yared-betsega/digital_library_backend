import { Request, Response, NextFunction } from 'express'
import { Comment } from './comment.model'
import { User } from '../user/user.model'
import { Material } from '../material/material.model'
import { toInteger } from 'lodash'
import { Reply } from '../reply/reply.model'

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { materialId, content } = req.body
  try {
    const { _id } = res.locals
    const user = await User.findById(_id)
    if (!user) {
      res.locals.json = {
        statusCode: 400,
        message: 'user not found'
      }
      return next()
    }
    const material = await Material.findOne({ _id: materialId })
    const comment = await Comment.create({
      materialId,
      userId: user._id,
      content
    })
    if (!material) {
      res.locals.json = {
        statusCode: 400,
        message: 'material does not exist'
      }
    } else if (!comment) {
      res.locals.json = {
        statusCode: 400,
        message: 'Unable to post comment'
      }
    } else {
      res.locals.json = {
        statusCode: 201,
        data: comment
      }
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: error.message
    }
  }
  return next()
}
export const getComment = async (req, res, next: NextFunction) => {
  try {
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1

    const materialId = req.params.materialId
    const comments = await Comment.find({ materialId: materialId })
      .skip((skip - 1) * limit)
      .limit(limit)
      .select('-__v')
      .populate([
        {
          path: 'userId',
          select: 'firstName photoUrl'
        },
        {
          path: 'replies',
          model: Reply,
          populate: {
            path: 'userId',
            select: 'firstName photoUrl'
          },
          select: '-__v'
        }
      ])

    const estimate = await Reply.find({
      materialId: materialId
    }).count()
    if (Object.keys(comments).length === 0) {
      res.locals.json = {
        statusCode: 400,
        message: 'no data found'
      }
      return next()
    }

    res.locals.json = {
      statusCode: 200,
      data: {
        comments: comments,
        hasNext: Math.ceil(estimate / limit) >= skip + 1
      }
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
export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = res.locals
  const commentId = req.params.commentId
  console.log(commentId)
  try {
    const comment = await Comment.findById(commentId)
    if (!(_id == comment.userId)) {
      res.locals.json = {
        statusCode: 400,
        message: 'Unautherized user!'
      }
      return next()
    }
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: `No comment with comment id ${commentId}`
    }
    return next()
  }
  try {
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $set: req.body
    })
    res.locals.json = {
      statusCode: 200,
      data: {
        comment: comment
      }
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 404,
      message: 'Bad request'
    }
    return next()
  }
}
