import E from 'http-errors'

import V from '../../validations.mjs'
import { Home, Invitation, User } from '../../models.mjs'

// @todo: When tasks will exists, a home deletion will result in task deletions
// also: maybe to delete a home, the approval of all inhabitants should be required ?
export async function controller(req, res, next) {
  const _id = req.params.id
  const homeId = req.user.homeId

  if (homeId?.toString() !== _id)
    return next(new E.Forbidden())

  const [doc] = await Promise.all([
    Home.deleteOne({ _id }),
    Invitation.deleteMany({ homeId }),
    User.updateMany({ homeId: _id }, { homeId: null })
  ])

  if (doc.deletedCount !== 1)
    return next(new E.NotFound())

  return res.status(204).send()
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
