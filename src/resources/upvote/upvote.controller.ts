import { Request, Response, NextFunction } from 'express'
import { User } from '../user/user.model'
import { Upvote } from './upvote.model'
import mongoose from 'mongoose'
import { getUpvoteCountByMaterialId } from './upvoteControllers'
import { Material } from '../material/material.model'
export const upvote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id } = res.locals
    const user = await User.findById(_id)
    const materialId = req.params.id

    if (!mongoose.isValidObjectId(materialId)) {
      res.locals.json = {
        statusCode: 400,
        message: 'invalid material ID'
      }
      return next()
    }

    const material = await Material.findById(materialId)

    if (!material) {
      res.locals.json = {
        statusCode: 404,
        message: 'Material Does not exist'
      }
      return next()
    }

    const isUpvotedByUser = await Upvote.findOne({
      materialId: materialId,
      userId: _id
    })

    const matId = new mongoose.Types.ObjectId(materialId)

    if (isUpvotedByUser) {
      const upvoteId = new mongoose.Types.ObjectId(isUpvotedByUser._id)
      user.upVotes.splice(user.upVotes.indexOf(upvoteId))
      user.save()
      material.upvoteCount -= 1
      await material.save()
      await isUpvotedByUser.delete()
      res.locals.json = {
        statusCode: 200,
        data: {
          upvoteCount: await getUpvoteCountByMaterialId(matId)
        }
      }
      return next()
    }

    const newUpvote = await Upvote.create({
      userId: _id,
      materialId
    })
    material.upvoteCount += 1
    await material.save()
    user.upVotes.push(newUpvote._id)
    user.save()
    res.locals.json = {
      statusCode: 200,
      data: {
        upvoteCount: await getUpvoteCountByMaterialId(matId)
      }
    }
    return next()
  } catch (error) {
    res.locals.json = {
      statusCode: 400,
      message: "couldn't upvote"
    }
    return next()
  }
}
