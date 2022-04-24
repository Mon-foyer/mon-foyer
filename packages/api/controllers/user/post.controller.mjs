import E from 'http-errors'
import crypto from 'crypto'
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import zxcvbnFrPackage from '@zxcvbn-ts/language-fr'

import V from '../../validations.mjs'
import { Home, User } from '../../models.mjs'

zxcvbnOptions.setOptions({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
    ...zxcvbnFrPackage.dictionary
  }
})

export async function controller(req, res) {
  const { name, password } = req.body

  if (await User.findOne({ name }, { _id: 1 }).lean())
    throw new E.Conflict('user_already_exists')

  if (zxcvbn(password).score < 3)
    throw new E.UnprocessableEntity('password_too_weak')

  const home = await new Home().save()
  const salt = crypto.randomBytes(16).toString('hex')
  const user = await User.create({
    homeId: home._id,
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
