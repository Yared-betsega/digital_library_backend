import { Request, Response, NextFunction } from 'express'
import { Comment } from './comment.model'
import { User } from '../user/user.model'
import { Material } from '../material/material.model'
import { toInteger } from 'lodash'
import { Reply } from '../reply/reply.model'
import mongoose from 'mongoose'

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

    if (!material) {
      res.locals.json = {
        statusCode: 400,
        message: 'material does not exist'
      }
      return next()
    }

    const comment = await Comment.create({
      materialId,
      userId: user._id,
      content
    })
    await comment.save()
    const commentId = comment._id
    const comments = await Comment.findById(commentId).populate([
      {
        path: 'userId',
        select: 'firstName photoURL'
      }
    ])

    if (!comment) {
      res.locals.json = {
        statusCode: 400,
        message: 'Unable to post comment'
      }
      return next()
    } else {
      res.locals.json = {
        statusCode: 201,
        data: { comment: comments }
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
export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let limit = toInteger(req.query.limit) || 10
    let skip = toInteger(req.query.skip) || 1

    const materialId = req.params.materialId
    const comments = await Comment.find({ materialId: materialId })
      .sort({ postDate: 'desc' })
      .skip((skip - 1) * limit)
      .limit(limit)
      .select('-__v')
      .populate([
        {
          path: 'userId',
          select: 'firstName lastName photoURL'
        },
        {
          path: 'replies',
          model: Reply,
          populate: {
            path: 'userId',
            select: 'firstName lastName photoURL'
          },
          select: '-__v'
        }
      ])

    const estimate = await Comment.find({
      materialId: materialId
    }).count()

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
  const updatedContent = req.body.content
  if (!updatedContent) {
    res.locals.json = {
      statusCode: 400,
      message: 'content field can not be empty!'
    }
    return next()
  }
  try {
    const comment = await Comment.findById(commentId)
    if (_id !== comment.userId.toString()) {
      res.locals.json = {
        statusCode: 400,
        message: 'Unauthorized user!'
      }
      return next()
    }
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: error.message
    }
    return next()
  }
  try {
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $set: { content: updatedContent }
    })
    res.locals.json = {
      statusCode: 200,
      data: { comment: comment }
    }
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: error.message
    }
  }
  return next()
}

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = res.locals
  const commentId = req.params.commentId
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
    const comment = await Comment.findByIdAndDelete(commentId)
    res.locals.json = {
      statusCode: 200,
      message: 'Deleted Sucessfully'
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

export const getCommentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.locals.json = {
        statusCode: 400,
        message: 'invalid ID'
      }
      return next()
    }

    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      res.locals.json = {
        statusCode: 404,
        message: 'comment not found'
      }
      return next()
    }
    res.locals.json = {
      statusCode: 200,
      data: comment
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 500,
      message: 'Server failed'
    }
  }
}
