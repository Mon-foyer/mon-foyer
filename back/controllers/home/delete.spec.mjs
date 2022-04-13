import { expect } from 'chai'
import G from '../../generators.mjs'
import { Home, ObjectId, User } from '../../models.mjs'

describe('delete /home/:id', () => {
  before(async() => {
    await Promise.all([
      G.newHome('home1').then(h => G.newUser('user1', { homeId: h._id })),
      G.newHome('home2').then(h => G.newUser('user2', { homeId: h._id })),
      G.newUser('user3', { homeId: new ObjectId() })
    ])
  })
  after(() => G.empty())
  describe('Sucesses', () => {
    it('Deletes a home', async() => {
      const [home1, user1] = G.get('home1', 'user1')

      await G.request(`delete /home/${home1._id}`, user1).send().expect(204)

      const [home, user] = await Promise.all([
        Home.findOne({ _id: home1._id }).lean(),
        User.findOne({ _id: user1._id }).lean()
      ])
      expect(home).null
      expect(user.homeId).null
    })
  })
  describe('Failures', () => {
    it('Returns 403 when a user tries to delete a home that does not belong to it', async() => {
      const [home2, user1] = G.get('home2', 'user1')

      await G.request(`delete /home/${home2._id}`, user1).send().expect(403)
    }),
    it('Returns 404 if the home does not exists', async() => {
      const user3 = G.get('user3')

      await G.request(`delete /home/${user3.homeId}`, user3).send().expect(404)

      const user = await User.findOne({ _id: user3._id }).lean()

      expect(user.homeId).null
    })
  })
})
