import { expect } from 'chai'
import G from '../../generators.mjs'
import { Home, User } from '../../models.mjs'

describe('GET /home/:id', () => {
  after(() => G.empty())

  describe('Sucesses', () => {
    it('Creates a new Home', async() => {
      const name = 'peorngpe'
      const user2 = await G.newUser()

      const { headers } = await G.request('post /home', user2).send({ name }).expect(201)
      const homeId = headers.location.split('/').at(-1)
      const [home, user] = await Promise.all([
        Home.findOne({ _id: homeId }),
        User.findOne({ _id: user2._id })
      ])

      expect(user.homeId.toString()).eq(homeId)
      expect(home).not.null
      expect(home.name).eq(name)
      expect(headers.location).eq(`/home/${home._id}`)
    })
  })

  describe('Failures', () => {
    it('Returns 409 when the user already has a home', async() => {
      const name = 'peorngpe'
      const home = await G.newHome()
      const user1 = await G.newUser({ homeId: home._id })

      await G.request('post /home', user1).send({ name }).expect(409)
    })
    it('Returns 400 when no name is given', async() => {
      const home = await G.newHome()
      const user3 = await G.newUser({ homeId: home._id })

      await G.request('post /home', user3).send({}).expect(400)
    })
  })
})
