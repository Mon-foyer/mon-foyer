import E from 'http-errors'

import V from '../../validations.mjs'
import { Invitation } from '../../models.mjs'

export async function controller(req, res, user) {
  const doc = await Invitation.deleteOne(
    { _id: req.params.id, $or: [{ inviterId: user._id }, { inviteeId: user._id }] }
  )

  if (doc.deletedCount !== 1)
    throw new E.NotFound()

  res.status(204).send()
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
