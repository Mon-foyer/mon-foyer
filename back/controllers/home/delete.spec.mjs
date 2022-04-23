import { expect } from 'chai'
import G from '../../generators.mjs'
import { Home, Invitation, ObjectId, User } from '../../models.mjs'

describe('delete /home/:id', () => {
  after(() => G.empty())

  describe('Sucesses', () => {
    it('Deletes a home and its pending invitations', async() => {
      const home = await G.newHome()
      const [inhabitant, someone] = await Promise.all([
        G.newUser({ homeId: home._id }), G.newUser()
      ])
      await G.newInvitation({ fromId: inhabitant._id, homeId: home._id, toId: someone._id })

      await G.request(`delete /home/${home._id}`, inhabitant).send().expect(204)

      const [uhome, nInvitations, user] = await Promise.all([
        Home.findOne({ _id: home._id }).lean(),
        Invitation.countDocuments({ homeId: home._id }),
        User.findOne({ _id: inhabitant._id }).lean()
      ])
      expect(nInvitations).eq(0)
      expect(uhome).null
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
