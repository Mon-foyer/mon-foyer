import E from 'http-errors'

import V from '../../validations.mjs'
import { User } from '../../models.mjs'

export async function controller(req, res, next) {
  // /!\ A user should only be able to get itself and the other members of its home
  const user = await User.findOne({ _id: req.params.id }, { password: 0, token: 0 }).lean()

  if (!user)
    return next(new E.NotFound())

  return res.status(200).send(user)
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
