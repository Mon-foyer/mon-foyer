// @file Test helpers

import request from 'supertest'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import app from './app.mjs'
import Chance from 'chance'

import { dropDatabase, Home, User } from './models.mjs'

const chance = new Chance()
const memory = new Map()
const server = request(app)

/**
 * Adds a new Data in the generators memory
 *
 * @param  {String} key   New data name to then retrieves it from the database
 * @param  {Model}  Model Mongoose model to save the new data
 * @param  {Object} obj   New data to save
 * @return {Promise<undefined>}
 */
async function set(key, Model, obj) {
  if (memory.has(key))
    throw new Error(`${key} already exists among test data !`)
  obj = await Model.create(obj)
  memory.set(key, obj)
  return obj
}

export default {
  // Clean generators
  empty: async() => Promise.all([memory.clear(), dropDatabase()]),
  /**
   * Get values stored in the generators memory
   *
   * @param  {String[]} keys   keys correspondig to the data to retrieve from the memory
   * @return {Object|Object[]} A data if keys.length === 1, otherwise, an Object[] with the data
   */
  get: function(...keys) {
    if(keys.length === 0)
      throw new Error(`Missing argument in get function`)

    const objs = []

    for (const key of keys)
      if (objs.length === objs.push(memory.get(key)))
        throw new Error(`${key} does not exists`)

    return objs.length === 1 ? objs[0] : objs
  },
  // Send a request to the test server
  request: (route, sender) => {
    const [verb, url] = route.split(' ')
    const pendingRequest = server[verb](url)

    sender && pendingRequest.set('Authorization', `bearer ${sender.token}`)
    return pendingRequest
  },

  newHome: async(key, home = {}) => {
    home = Object.assign({ name: chance.name() }, home)

    return set(key, Home, home)
  },

  newUser: async(key, user = {}) => {
    user = Object.assign({ name: chance.name(), password: 'The pass !' }, user)

    const salt = crypto.randomBytes(16).toString('hex')

    user.password = `${salt}:${crypto.pbkdf2Sync(user.password, salt, 1000, 64, `sha512`)
      .toString(`hex`)}`
    user.token = jwt.sign({ name: user.name }, process.env.MF_JWT_SECRET, { expiresIn: '10m' })

    return set(key, User, user)
  }
}
