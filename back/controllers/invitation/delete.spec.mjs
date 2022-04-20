import { expect } from 'chai'
import G from '../../generators.mjs'
import { Invitation } from '../../models.mjs'

describe('DELETE /invitation/:id', () => {
  after(() => G.empty())

  describe('Success', () => {
    it('Deletes activities in which the user is the inviter', async() => {
      const [inviter, invitee] = await Promise.all([G.newUser(), G.newUser()])
      const invitation = await G.newInvitation({ fromId: inviter._id, toId: invitee._id })
      await G.request(`delete /invitation/${invitation._id}`, inviter).expect(204)
      expect(await Invitation.findOne({ _id: invitation._id })).null
    })

    it('Deletes activities in which the user is the invitee', async() => {
      const [inviter, invitee] = await Promise.all([G.newUser(), G.newUser()])
      const invitation = await G.newInvitation({ fromId: inviter._id, toId: invitee._id })
      await G.request(`delete /invitation/${invitation._id}`, invitee).expect(204)
      expect(await Invitation.findOne({ _id: invitation._id })).null
    })
  })

  describe('Failure', () => {
  })

})
