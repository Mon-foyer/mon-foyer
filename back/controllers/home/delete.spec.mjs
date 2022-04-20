import { expect } from 'chai'
import G from '../../generators.mjs'
import { Home, ObjectId, User } from '../../models.mjs'

describe('delete /home/:id', () => {
  after(() => G.empty())

  describe('Sucesses', () => {
    it('Deletes a home', async() => {
      const home1 = await G.newHome()
      const user1 = await G.newUser({ homeId: home1._id })

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
      const [home2, home3] = await Promise.all([G.newHome(), G.newHome()])
      const user2 = await G.newUser({ homeId: home2._id })

      await G.request(`delete /home/${home3._id}`, user2).send().expect(403)
    }),
    it('Returns 404 if the home does not exists', async() => {
      const user3 = await G.newUser({ homeId: new ObjectId() })

      await G.request(`delete /home/${user3.homeId}`, user3).send().expect(404)

      const user = await User.findOne({ _id: user3._id }).lean()

      expect(user.homeId).null
    })
  })
})
