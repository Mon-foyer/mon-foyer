import E from 'http-errors'
import express from 'express'
import passport from 'passport'
import BearerStrategy from 'passport-http-bearer'

import { User } from './models.mjs'

import * as authLoginPost from './controllers/auth/login.controller.mjs'
import * as homeDelete    from './controllers/home/delete.controller.mjs'
import * as homePost      from './controllers/home/post.controller.mjs'
import * as inviteAccept  from './controllers/invitation/accept.controller.mjs'
import * as inviteDelete  from './controllers/invitation/delete.controller.mjs'
import * as invitePost    from './controllers/invitation/post.controller.mjs'
import * as userGet       from './controllers/user/get.controller.mjs'
import * as userPost      from './controllers/user/post.controller.mjs'

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
  .post('/auth/login',                    validate(authLoginPost.schemas), authLoginPost.controller)
  .post('/home',              bearerAuth, validate(homePost.schemas),      homePost.controller)
  .delete('/home/:id',        bearerAuth, validate(homeDelete.schemas),    homeDelete.controller)
  .post('/invitation',        bearerAuth, validate(invitePost.schemas),    invitePost.controller)
  .delete('/invitation/:id',  bearerAuth, validate(inviteDelete.schemas),  inviteDelete.controller)
  .delete(
    '/invitation/:id/accept', bearerAuth, validate(inviteAccept.schemas),  inviteAccept.controller
  )
  .post('/user',                          validate(userPost.schemas),      userPost.controller )
  .get('/user/:id',           bearerAuth, validate(userGet.schemas),       userGet.controller)
  .use('*', (req, res, next) => next(new E.NotFound()))
