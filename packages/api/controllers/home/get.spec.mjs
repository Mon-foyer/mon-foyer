import { expect } from 'chai'
import G from '../../generators.mjs'

describe('GET /home', () => {
  after(() => G.empty())

  describe('Sucesses', () => {
    it('Gets a user\'s home with its inhabitants', async() => {
      const home = await G.newHome()
      const [inhabitant1, inhabitant2] = await Promise.all([
        G.newUser({ homeId: home._id, name: 'AAA' }),
        G.newUser({ homeId: home._id, name: 'BBB' })
      ])

      const { body } = await G.request(`get /home`, inhabitant1).expect(200)

      body.inhabitants.sort((a, b) => a.name.localeCompare(b.name))
      expect(body).keys('_id', 'name', 'createdAt', 'updatedAt', 'inhabitants')
      expect(body.inhabitants).eql([{
        _id: inhabitant1._id.toString(),
        name: inhabitant1.name,
        shownName: null,
        createdAt: inhabitant1.createdAt.toISOString(),
        joinedAt: inhabitant1.joinedAt.toISOString(),
        updatedAt: inhabitant1.updatedAt.toISOString()
      }, {
        _id: inhabitant2._id.toString(),
        name: inhabitant2.name,
        shownName: null,
        createdAt: inhabitant2.createdAt.toISOString(),
        joinedAt: inhabitant2.joinedAt.toISOString(),
        updatedAt: inhabitant2.updatedAt.toISOString()
      }])
    })
  })

})
