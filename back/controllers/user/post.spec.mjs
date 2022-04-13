import { expect } from 'chai'
import G from '../../generators.mjs'
import { User } from '../../models.mjs'

describe('POST /user', () => {
  after(() => G.empty())
  describe('Sucesses', () => {
    it('Creates a new user', async() => {
      const { headers } = await G.request('post /user')
        .send({ name: 'ggg', password: 'eoirfoierfeorighe' })
        .expect(201)
      const userId = headers.location.split('/').at(-1)
      const user = await User.findOne({ _id: userId })

      expect(user).not.null
      expect(user.password).match(/^[a-z\d]{32}:[a-z\d]+$/)
      expect(headers.location).eq(`/user/${user._id}`)
    })
  })
  describe('Failures', () => {
    it('Returns a 409 when a user already exists', async() => {
      const name = 'rferf'

      await G.request('post /user').send({ name, password: 'eoirfoierfeorighe' }).expect(201)
      const { body } = await G.request('post /user').send({ name, password: 'eoirfoierfeorigh' })
        .expect(409)
      expect(body).eql({ error: { status: 409, message: 'user_already_exists' } })
    })
    it('Returns a 422 when the user\'s password is too weak', async() => {
      const { body } = await G.request('post /user').send({ name: 'iuzgf', password: 'aaa' })
        .expect(422)
      expect(body).eql({ error: { status: 422, message: 'password_too_weak' } })
    })
  })
})
