import { Upvote } from '../resources/upvote/upvote.model'

export const isUpvoted = async (materials, id) => {
  const final = []
  for (let index = 0; index < Object.keys(materials).length; index++) {
    let is_true = false
    const x = await Upvote.find({
      materialId: materials[index].id,
      userId: id
    })
    if (x.length > 0) {
      is_true = true
    }
    let userObj = {
      _id: materials[index].id,
      title: materials[index].title,
      department: materials[index].department,
      tags: materials[index].tags,
      upvoteCount: materials[index].upvoteCount,
      user: materials[index].user,
      levelOfEducation: materials[index].levelOfEducation,
      type: materials[index].type,
      typeId: materials[index].typeId,
      viewCount: materials[index].viewCount,
      description: materials[index].description,
      isUpvoted: is_true
    }
    final.push(userObj)
  }

  return final
}
