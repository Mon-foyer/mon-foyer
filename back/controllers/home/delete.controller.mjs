import E from 'http-errors'

import V from '../../validations.mjs'
import { Home, User } from '../../models.mjs'

export async function controller(req, res, next) {
  const { id: homeId } = req.params

  if (req.user.homeId?.toString() !== homeId)
    return next(new E.Forbidden())

  const [doc] = await Promise.all([
    Home.deleteOne({ _id: homeId }),
    User.updateMany({ homeId }, { homeId: null })
  ])

  if (doc.deletedCount !== 1)
    return next(new E.NotFound())

  return res.status(204).send()
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
