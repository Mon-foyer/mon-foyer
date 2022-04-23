import E from 'http-errors'

import V from '../../validations.mjs'
import { Invitation } from '../../models.mjs'

export async function controller(req, res, next) {
  const doc = await Invitation.deleteOne(
    { _id: req.params.id, $or: [{ inviterId: req.user._id }, { inviteeId: req.user._id }] }
  )

  if (doc.deletedCount !== 1)
    return next(new E.NotFound())

  return res.status(204).send()
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
