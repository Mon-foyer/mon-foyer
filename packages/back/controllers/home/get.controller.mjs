import E from 'http-errors'

import V from '../../validations.mjs'
import { Home, ObjectId } from '../../models.mjs'

export async function controller(req, res) {
  const _id = req.params.id

  if (!req.user.homeId || _id !== req.user.homeId.toString())
    throw new E.Forbidden()

  const home = await Home.aggregate([
    { $match: { _id: new ObjectId(_id) } },
    { $lookup: { from: 'users', as: 'inhabitants', localField: '_id', foreignField: 'homeId' } }
  ])

  if (!home[0])
    throw new E.NotFound()

  res.send(200).send(home[0])
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
