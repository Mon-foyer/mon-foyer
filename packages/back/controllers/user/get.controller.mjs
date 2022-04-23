import E from 'http-errors'

import V from '../../validations.mjs'
import { User } from '../../models.mjs'

const userFields = { _id: 1, createdAt: 1, homeId: 1, name: 1, updatedAt: 1 }

export async function controller(req, res, next) {
  // A user should only be able to get itself and the other members of its home
  const _id = req.params.id
  const requester = req.user

  if (!requester.homeId && _id !== requester._id.toString())
    throw new E.Forbidden()

  const user = await User.findOne({ _id, homeId: requester.homeId }, userFields).lean()

  if (!user)
    return next(new E.NotFound())

  return res.status(200).send(user)
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
