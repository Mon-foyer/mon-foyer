import E from 'http-errors'
import express from 'express'
import passport from 'passport'
import BearerStrategy from 'passport-http-bearer'

import { User } from './models.mjs'

import * as authLoginPost    from './controllers/auth/login.controller.mjs'
import * as homeGet          from './controllers/home/get.controller.mjs'
import * as invitationAccept from './controllers/invitation/accept.controller.mjs'
import * as invitationDelete from './controllers/invitation/delete.controller.mjs'
import * as invitationGet    from './controllers/invitation/get.controller.mjs'
import * as invitationPost   from './controllers/invitation/post.controller.mjs'
import * as userGet          from './controllers/user/get.controller.mjs'
import * as userPatch        from './controllers/user/patch.controller.mjs'
import * as userPost         from './controllers/user/post.controller.mjs'

passport.use(
  new BearerStrategy( // done(err, user, { scope: 'all' })
    (token, done) => User.findOne({ token }, (err, user) => done(err, user || false))
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
function validate({ schemas }) {
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

/**
 * Generates a Middleware that executes a controller
 *
 * @param  {Function} controller Controller to execute
 * @return {Function}
 */
function run({ controller }) {
  return async(req, res, next) => {
    try {
      await controller(req, res, req.user)
      next()
    }
    catch(err) {
      // console.error(err)
      next(err)
    }
  }
}

export default express.Router()
  .post('/auth/login',                          validate(authLoginPost),    run(authLoginPost))
  .get('/home',                     bearerAuth,                             run(homeGet))
  .post('/invitation',              bearerAuth, validate(invitationPost),   run(invitationPost))
  .delete('/invitation/:id',        bearerAuth, validate(invitationDelete), run(invitationDelete))
  .delete('/invitation/:id/accept', bearerAuth, validate(invitationAccept), run(invitationAccept))
  .get('/invitation',               bearerAuth,                             run(invitationGet))
  .patch('/user',                   bearerAuth, validate(userPatch),        run(userPatch) )
  .post('/user',                                validate(userPost),         run(userPost) )
  .get('/user/:id',                 bearerAuth, validate(userGet),          run(userGet))
  .use('*', (req, res, next) => next(new E.NotFound()))
