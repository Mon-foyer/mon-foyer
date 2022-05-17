import V from '../../validations.mjs'

export async function controller(req, res, user) {
  if (req.body.leaveHome)
    await user.changeHome()
  else {
    user.shownName = req.body.shownName || user.shownName
    await user.save()
  }
  res.status(204).send()
}

export const schemas = {
  body: V.object({
    leaveHome: V.boolean.default(false).optional(),
    shownName: V.name.optional()
  })
}
