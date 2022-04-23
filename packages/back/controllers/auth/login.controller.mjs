import E from 'http-errors'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import V from '../../validations.mjs'
import { User } from '../../models.mjs'

export async function controller(req, res, next) {
  const { name, password } = req.body
  const user = await User.findOne({ name }, { _id: 1, password: 1 }).lean()

  if (!user)
    return next(new E.Unauthorized())

  const [salt, hash] = user.password.split(':')
  const encrypted = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`)

  if (hash !== encrypted)
    return next(new E.Unauthorized())

  const token = jwt.sign({ name }, process.env.MF_JWT_SECRET, { expiresIn: '30d' })

  await User.updateOne({ _id: user._id }, { token })

  return res.status(200).send({ token })
}

export const schemas = {
  body: V.object({
    name: V.name.required(),
    password: V.password.required()
  })
}
