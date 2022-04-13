import app from './app.mjs'
import { dbConnect, dbClose } from './models.mjs'

const port = 6242

async function exitHandler() {
  console.log('[Express] Exiting server...')
  await Promise.all([
    dbClose(),
    server && server.close()
  ])
  console.log('[Express] Done !')
}

process.on('exit', exitHandler.bind(null))
process.on('SIGINT', exitHandler.bind(null))

const [server] = await Promise.all([
  app.listen(port, async(err) => {
    err ? console.error(err) : console.log('[Express] App running on port', port)
  }),
  dbConnect()
])
