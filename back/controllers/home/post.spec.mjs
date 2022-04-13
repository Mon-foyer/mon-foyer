import { expect } from 'chai'
import G from '../../generators.mjs'
import { Home, User } from '../../models.mjs'

describe('GET /home/:id', () => {
  before(async() => {
    await Promise.all([
      G.newHome('home1').then(h => G.newUser('user1', { homeId: h._id })),
      G.newUser('user2')
    ])
  })
  after(() => G.empty())
  describe('Sucesses', () => {
    it('Creates a new Home', async() => {
      const name = 'peorngpe'
      const user2 = G.get('user2')

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
  }),
  describe('Failures', () => {
    it('Returns 409 when the user already has a home', async() => {
      const name = 'peorngpe'
      const user1 = G.get('user1')

      await G.request('post /home', user1).send({ name }).expect(409)
    })
    it('Returns 400 when no name is given', async() => {
      const user1 = G.get('user1')

      await G.request('post /home', user1).send({}).expect(400)
    })
  })
})
