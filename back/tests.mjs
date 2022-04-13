console.time('[Tests] Execution time')
console.time('[Tests] Total loading time')

process.env.NODE_ENV = 'test'

import glob from 'glob'
import Mocha from 'mocha'

import './app.mjs'
import { dbConnect, dbClose } from './models.mjs'

const argv = process.argv
const folder = argv[2] && argv[2][0] !== '-' ? '*/' + argv[2] : '**/'
const file = argv[3] && argv[3][0] !== '-' ? argv[3] : '**/*'
const globOpts = { ignore: 'node_modules/**', nocase: true, nosort: true, strict: true }
const mocha = new Mocha({
  rootHooks: { beforeAll: () => dbConnect(), afterAll: () => dbClose() },
  timeout: 500
})

console.time('[Tests] Loading test files')

glob(`${folder}/${file}.spec.mjs`, globOpts, async() => {
  console.timeEnd('[Tests] Loading test files')

  await mocha.loadFilesAsync()
  console.timeEnd('[Tests] Total loading time')

  console.time('[Tests] Running time')
  mocha.run(failures => {
    console.timeEnd('[Tests] Running time')
    process.exitCode = failures ? 1 : 0
    console.timeEnd('[Tests] Execution time')
  })
})
  .on('match', file => mocha.addFile(file))
  .on('error', err => console.error(err))
