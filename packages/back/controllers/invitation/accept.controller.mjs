import E from 'http-errors'

import V from '../../validations.mjs'
import { Invitation, User } from '../../models.mjs'

export async function controller(req, res) {
  const user = req.user
  const { _id: inviteeId } = user
  const invitation = await Invitation.findOne({ _id: req.params.id, inviteeId }).lean()

  if (!invitation)
    throw new E.NotFound()

  const inviter = await User.findOne({ _id: invitation.inviterId }, { _id: 0, homeId: 1 }).lean()

  if (!inviter)
    throw new E.FailedDependency('inviter')

  await Promise.all([
    user.changeHome(inviter.homeId),
    Invitation.deleteMany({ $or: [{ inviterId: inviteeId }, { inviteeId }] })
  ])

  res.status(204).send()
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
