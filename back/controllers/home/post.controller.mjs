import E from 'http-errors'
import V from '../../validations.mjs'

import { Home, User } from '../../models.mjs'

export async function controller(req, res, next) {
  if (req.user.homeId)
    return next(new E.Conflict('user_has_home'))

  const home = await Home.create({ inhabitants: [req.user._id], name: req.body.name })
  await User.updateOne({ _id: req.user._id }, { homeId: home._id })

  return res.location(`/home/${home._id}`).status(201).send()
}

export const schemas = {
  body: V.object({ name: V.name.required() })
}
