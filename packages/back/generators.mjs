// @file Test helpers

import request from 'supertest'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import app from './app.mjs'
import Chance from 'chance'

import { dropDatabase, Home, Invitation, User } from './models.mjs'

const chance = new Chance()
const server = request(app)

export default {
  // Empty the database
  empty: async() => dropDatabase(),
  // Sends a request to the test server
  request: (route, sender) => {
    const [verb, url] = route.split(' ')
    const pendingRequest = server[verb](url)

    sender && pendingRequest.set('Authorization', `bearer ${sender.token}`)
    return pendingRequest
  },

  newHome: async(home = {}) => {
    return Home.create(Object.assign({ name: chance.name() }, home))
  },

  newInvitation: async(invitation = {}) => {
    return Invitation.create(invitation)
  },

  newUser: async(user = {}) => {
    // UUID() to avoid generating duplicated names
    user = Object.assign({ name: crypto.randomUUID(), password: 'The pass !' }, user)

    const salt = crypto.randomBytes(16).toString('hex')

    user.password = `${salt}:${crypto.pbkdf2Sync(user.password, salt, 1000, 64, `sha512`)
      .toString(`hex`)}`
    user.token = jwt.sign({ name: user.name }, process.env.MF_JWT_SECRET, { expiresIn: '10m' })

    return User.create(user)
  }
}
