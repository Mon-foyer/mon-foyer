import { expect } from 'chai'
import G from '../../generators.mjs'
import { ObjectId } from '../../models.mjs'

describe('GET /user/:id', () => {
  before(async() => {
    await G.newUser('user1', { name: 'zpif' })
  })
  after(() => G.empty())
  describe('Sucesses', () => {
    it('Gets a user', async() => {
      const requester = G.get('user1')
      const { body } = await G.request(`get /user/${requester._id}`, requester).expect(200)

      expect(body.name).eq('zpif')
      expect(body.token).undefined
      expect(body.password).undefined
    })
  })
  describe('Failures', () => {
    it('Returns 400 when the id is invalid', async() => {
      const requester = G.get('user1')

      await G.request('get /user/tomato!', requester).expect(400)
    })
    it('Returns 404 when the user does not exists', async() => {
      const requester = G.get('user1')

      await G.request(`get /user/${new ObjectId()}`, requester).expect(404)
    })
  })
})
