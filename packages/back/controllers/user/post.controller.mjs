import E from 'http-errors'
import crypto from 'crypto'
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import zxcvbnFrPackage from '@zxcvbn-ts/language-fr'

import V from '../../validations.mjs'
import { User } from '../../models.mjs'

zxcvbnOptions.setOptions({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
    ...zxcvbnFrPackage.dictionary
  }
})

export async function controller(req, res, next) {
  const { name, password } = req.body

  if (await User.findOne({ name }, { _id: 1 }).lean())
    return next(new E.Conflict('user_already_exists'))

  if (zxcvbn(password).score < 3)
    return next(new E.UnprocessableEntity('password_too_weak'))

  const salt = crypto.randomBytes(16).toString('hex')
  const user = await User.create({
    name,
    password: `${salt}:${crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`)}`
  })

  return res.location(`/user/${user._id}`).status(201).send()
}

export const schemas = {
  body: V.object({
    name: V.name.required(),
    password: V.password.required()
  })
}
