import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import router from './router.mjs'

dotenv.config()

export default express()
  .disable('x-powered-by')
  .use(bodyParser.json({ limit: '5mb' }))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(router)
  .use((err, req, res, next) => {
    if (res.headersSent)
      next(err)
    else {
      res.status(err.status || 500).send({ error: { status: err.status, message: err.message } })
      next()
    }
  })
