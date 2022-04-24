import E from 'http-errors'

import V from '../../validations.mjs'
import { Home, Invitation, User } from '../../models.mjs'

export async function controller(req, res) {
  const invitee = req.user
  const oldHomeId = req.user.homeId
  const invitation = await Invitation.findOne({ _id: req.params.id, inviteeId: invitee._id }).lean()

  if (!invitation)
    throw new E.NotFound()

  const inviter = await User.findOne({ _id: invitation.inviterId }, { _id: 0, homeId: 1 }).lean()

  if (!inviter)
    throw new E.FailedDependency('inviter')

  await Promise.all([
    User.updateOne({ _id: invitee._id }, { homeId: inviter.homeId }),
    Invitation.deleteMany({ $or: [{ inviterId: invitee._id }, { inviteeId: invitee._id }] })
  ])

  if (await User.countDocuments({ homeId: oldHomeId }) === 0)
    await Home.deleteOne({ _id: oldHomeId })

  return res.status(204).send()
}

export const schemas = {
  params: V.object({ id: V.id.required() })
}
