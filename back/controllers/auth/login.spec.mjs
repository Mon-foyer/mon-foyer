import { expect } from 'chai'
import G from '../../generators.mjs'

describe('POST /auth/login', () => {
  after(() => G.empty())
  describe('Sucesses', () => {
    it('Logs a user after its creation', async() => {
      const payload = { name: 'ggg', password: 'eoirfoierfeorighe' }
      await G.request('post /user').send(payload).expect(201)
      const { body } = await G.request('post /auth/login').send(payload).expect(200)

      expect(body.token).a('string')
    })
  })
  describe('Failures', () => {
    it('Returns a 401 when a user does not exists', async() => {
      await G.request('post /auth/login').send({ name: 'toto', password: 'eorighe' }).expect(401)
    })

    it('Returns a 401 when a user exists but sends the wrong password', async() => {
      await G.request('post /auth/login').send({ name: 'ggg', password: 'fail' }).expect(401)
    })

  })
})
