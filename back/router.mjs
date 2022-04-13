import E from 'http-errors'
import express from 'express'
import passport from 'passport'
import BearerStrategy from 'passport-http-bearer'

import { User } from './models.mjs'

import * as deleteHome from './controllers/home/delete.controller.mjs'
import * as getUser from './controllers/user/get.controller.mjs'
import * as postAuthLogin from './controllers/auth/login.controller.mjs'
import * as postHome from './controllers/home/post.controller.mjs'
import * as postUser from './controllers/user/post.controller.mjs'

passport.use(
  new BearerStrategy( // done(err, user, { scope: 'all' })
    (token, done) => User.findOne({ token }, (err, user) => done(err, user || false)).lean()
  )
)

const bearerAuth = passport.authenticate('bearer', { session: false })

/**
 * Generates a Joi validation middleware.
 * It validates route inputs and returns a BadRequest if a variable has a different content
 * than its description in a model
 *
 * @param  {Object}   schemas Schemas to validate as { key: schmas }
 * @return {Function}         Validation middleware
 */
function validate(schemas) {
  return (req, res, next) => {
    for (const [key, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[key])

      if (error)
        return next(new E.BadRequest(error.details[0].message))
      req[key] = value
    }
    return next()
  }
}

export default express.Router()
  .post('/auth/login',              validate(postAuthLogin.schemas), postAuthLogin.controller)
  .post('/home',        bearerAuth, validate(postHome.schemas),      postHome.controller)
  .delete('/home/:id',  bearerAuth, validate(deleteHome.schemas),    deleteHome.controller)
  .post('/user',                    validate(postUser.schemas),      postUser.controller )
  .get('/user/:id',     bearerAuth, validate(getUser.schemas),       getUser.controller)
  .use('*', (req, res, next) => next(new E.NotFound()))
