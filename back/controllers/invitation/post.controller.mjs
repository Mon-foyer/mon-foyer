import E from 'http-errors'

import V from '../../validations.mjs'
import { Invitation, User } from '../../models.mjs'

// should we check whether the target user is in a home before the invitation creation ?
// should a default home be created when a user creates its account ?
// then, if the user accepts an invitation, its home is deleted.

export async function controller(req, res, next) {
  const { user } = req
  const { name } = req.body

  if (!user.homeId)       return next(new E.UnprocessableEntity('no_home'))
  if (name === user.name) return next(new E.UnprocessableEntity('invite_yourself'))

  const [pendingExists, toUser] = await Promise.all([
    Invitation.findOne({ fromId: user._id }, { _id: 1 }).lean(),
    User.findOne({ name }, { _id: 1 }).lean()
  ])

  if (pendingExists)      return next(new E.UnprocessableEntity('too_many_invitation'))
  if (!toUser)            return next(new E.FailedDependency('user'))

  await Invitation.create({ fromId: user._id, toId: toUser._id })

  return res.location('/invitation/pendings').status(201).send()
}

export const schemas = {
  body: V.object({
    name: V.name.required()
  })
}
