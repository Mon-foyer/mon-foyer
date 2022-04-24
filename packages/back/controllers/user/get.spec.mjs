import { expect } from 'chai'
import G from '../../generators.mjs'
import { ObjectId } from '../../models.mjs'

describe('GET /user/:id', () => {
  after(() => G.empty())

  describe('Sucesses', () => {
    it('Gets a user', async() => {
      const requester = await G.newUser()
      const { body } = await G.request(`get /user/${requester._id}`, requester).expect(200)

      expect(body.name).eq(requester.name)
      expect(body.token).undefined
      expect(body.password).undefined
    })
  })

  describe('Failures', () => {
    it('Returns 400 when the id is invalid', async() => {
      const requester = await G.newUser()

      await G.request('get /user/tomato!', requester).expect(400)
    })
    it('Returns 404 when the requester has a home but the target does not exists', async() => {
      const home = await G.newHome()
      const requester = await G.newUser({ homeId: home._id })

      await G.request(`get /user/${new ObjectId()}`, requester).expect(404)
    })
    it('Returns 404 when the requester has no home and the target does not exists', async() => {
      const requester = await G.newUser()

      await G.request(`get /user/${new ObjectId()}`, requester).expect(404)
    })
    it('Returns 404 when the user exists but is not part of the requester\'s home', async() => {
      const home = await G.newHome()
      const [requester, target] = await Promise.all([
        G.newUser({ homeId: home._id }),
        G.newUser()
      ])
      await G.request(`get /user/${target._id}`, requester).expect(404)
    })
  })
})
