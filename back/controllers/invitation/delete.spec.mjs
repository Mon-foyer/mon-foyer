import { expect } from 'chai'
import G from '../../generators.mjs'
import { Invitation, ObjectId } from '../../models.mjs'

describe('DELETE /invitation/:id', () => {
  after(() => G.empty())

  describe('Success', () => {
    it('Deletes activities in which the user is the inviter', async() => {
      const home = await G.newHome()
      const [inviter, invitee] = await Promise.all([G.newUser({ homeId: home._id }), G.newUser()])
      const invitation = await G.newInvitation({
        fromId: inviter._id, homeId: inviter.homeId, toId: invitee._id
      })
      await G.request(`delete /invitation/${invitation._id}`, inviter).expect(204)
      expect(await Invitation.findOne({ _id: invitation._id })).null
    })

    it('Deletes activities in which the user is the invitee', async() => {
      const home = await G.newHome()
      const [inviter, invitee] = await Promise.all([G.newUser({ homeId: home._id }), G.newUser()])
      const invitation = await G.newInvitation({
        fromId: inviter._id, homeId: inviter.homeId, toId: invitee._id
      })
      await G.request(`delete /invitation/${invitation._id}`, invitee).expect(204)
      expect(await Invitation.findOne({ _id: invitation._id })).null
    })
  })

  describe('Failure', () => {
    it('Returns 404 when a user tries to delete the invitation of someone else', async() => {
      const home = await G.newHome()
      const [inviter, invitee, someone] = await Promise.all([
        G.newUser({ homeId: home._id }), G.newUser(), G.newUser()
      ])
      const invitation = await G.newInvitation({
        fromId: inviter._id, homeId: inviter.homeId, toId: invitee._id
      })
      await G.request(`delete /invitation/${invitation._id}`, someone).expect(404)
      expect(await Invitation.findOne({ _id: invitation._id }).lean()).not.null
    })

    it('Returns 404 when the invitation does not exists', async() => {
      const user = await G.newUser()

      await G.request(`delete /invitation/${new ObjectId()}`, user).expect(404)
    })

    it('Returns 400 when the id is invalid', async() => {
      const user = await G.newUser()

      await G.request(`delete /invitation/zporf`, user).expect(400)
    })
  })

})
