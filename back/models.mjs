'use strict'

import mongoose from 'mongoose'
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

export { ObjectId }

const defaultModelOptions = { id: false, timestamps: true, versionKey: false }

export const Home = mongoose.model('Homse', new Schema({
  name: { type: String }
}, defaultModelOptions))

export const User = mongoose.model('User', new Schema({
  homeId:   { type: ObjectId, default: null },
  name:     { type: String, default: '' },
  password: { type: String },
  salt:     { type: String },
  token:    { type: String, default: null }
}, defaultModelOptions))

/**
 * Connects to the mongodb database
 *
 * @param  {String} uri         Database uri
 * @return {Promise<undefined>}
 */
export async function dbConnect() {
  console.log(`[Mongo] Connecting to ${process.env.MF_MONGODB_URI}...`)
  await mongoose.connect(process.env.MF_MONGODB_URI)
  console.log('[Mongo] Done !')
}

/**
 * Empty the database only if NODE_ENV is 'test'
 *
 * @return {Promise<undefined>}
 */
export async function dropDatabase() {
  if (process.env.NODE_ENV === 'test') {
    console.log(`[Mongo] Drop database.`)
    await mongoose.connection.db.dropDatabase()
  }
}

/**
 * Closes mongoose connection to the DB and drops the database in test env to avoid having
 * fixtures that might not have been deleted between tests
 *
 * @return {Promise<undefined>}
 */
export async function dbClose() {
  console.log('[Mongo] Closing mongodb...')
  await mongoose.disconnect()
  console.log('[Mongo] Done !')
}
