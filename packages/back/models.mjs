import mongoose from 'mongoose'
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

export { ObjectId }

const defaultModelOptions = { id: false, timestamps: true, versionKey: false }
const defaultHomeNames = [
  'Cul-de-Sac', 'Le Terrier', 'Mon Nid', 'Mon Cocon', 'Mon Foyer', 'Chez moi'
]

export const Home = mongoose.model('Home', new Schema({
  name: {
    type: String,
    default: defaultHomeNames[Math.floor(Math.random() * (defaultHomeNames.length - 1))],
    required: true,
  }
}, defaultModelOptions))

export const Invitation = mongoose.model('Invitation', new Schema({
  inviterId: { type: ObjectId, required: true },
  homeId:    { type: ObjectId, required: true },
  inviteeId: { type: ObjectId, required: true }
}, defaultModelOptions))

const UserSchema = new Schema({
  homeId:   { type: ObjectId, required: true },
  joinedAt: { type: Date, default: () => new Date(), required: false },
  name:     { type: String, required: true },
  password: { type: String, required: true },
  token:    { type: String, default: null }
}, defaultModelOptions)

UserSchema.methods = {
  changeHome: async function(newHomeId=null) {
    const Home = mongoose.model('Home')
    const User = mongoose.model('User')
    const oldHomeId = this.homeId

    if (!newHomeId) {
      const home = await new Home().save()
      newHomeId = home._id
    }

    await this.updateOne({ homeId: newHomeId, joinedAt: new Date() })

    if (!await User.findOne({ homeId: oldHomeId }, { _id: 1 }).lean()) {
      await Promise.all([
        Home.deleteOne({ _id: oldHomeId }),
        mongoose.model('Invitation').deleteMany({ homeId: oldHomeId })
      ])
    }
  }
}

export const User = mongoose.model('User', UserSchema)


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
