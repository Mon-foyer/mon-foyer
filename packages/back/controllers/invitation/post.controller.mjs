import E from 'http-errors'

import V from '../../validations.mjs'
import { Invitation, User } from '../../models.mjs'

export async function controller(req, res) {
  const inviter = req.user
  const { name } = req.body

  if (!inviter.homeId)
    throw new E.UnprocessableEntity('no_home')
  if (name === inviter.name)
    throw new E.UnprocessableEntity('invite_yourself')

  const [pendingExists, invitee] = await Promise.all([
    Invitation.findOne({ inviterId: inviter._id }, { _id: 1 }).lean(),
    User.findOne({ name }, { _id: 1 }).lean()
  ])

  if (pendingExists)
    throw new E.UnprocessableEntity('too_many_invitation')
  if (!invitee)
    throw new E.FailedDependency('user')

  await Invitation.create({
    inviterId: inviter._id, homeId: inviter.homeId, inviteeId: invitee._id
  })

  return res.location('/invitation').status(201).send()
}

export const schemas = {
  body: V.object({
    name: V.name.required()
  })
}
