import E from 'http-errors'

import V from '../../validations.mjs'
import { Invitation, User } from '../../models.mjs'

export async function controller(req, res, next) {
  const invitee = req.user
  const invitation = await Invitation.findOne({ _id: req.params.id, inviteeId: invitee._id }).lean()

  if (!invitation)
    return next(new E.NotFound())

  const inviter = await User.findOne({ _id: invitation.inviterId }, { _id: 0, homeId: 1 }).lean()

  if (!inviter)
    return next(new E.FailedDependency('inviter'))

  await Promise.all([
    User.updateOne({ _id: invitee._id }, { homeId: inviter.homeId }),
    Invitation.deleteMany({ $or: [{ inviterId: invitee._id }, { inviteeId: invitee._id }] })
  ])

  return res.status(204).send()
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
