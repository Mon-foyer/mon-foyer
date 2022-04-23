import { expect } from 'chai'
import G from '../../generators.mjs'
import { Invitation, ObjectId, User } from '../../models.mjs'

describe('DELETE /invitation/:id/accept', () => {
  after(() => G.empty())

  describe('Success', () => {
    it('Accepts an invitation and deletes other pendings invitations', async() => {
      const [homeA, homeB] = await Promise.all([G.newHome(), G.newHome()])
      const [someone, inviter, invitee] = await Promise.all([
        G.newUser({ homeId: homeB._id }), G.newUser({ homeId: homeA._id }), G.newUser()
      ])

      const [invitationA, invitationB] = await Promise.all([
        G.newInvitation({ inviterId: inviter._id, inviteeId: invitee._id, homeId: inviter.homeId }),
        G.newInvitation({ inviterId: someone._id, inviteeId: invitee._id, homeId: someone.homeId })
      ])

      await G.request(`delete /invitation/${invitationA._id}/accept`, invitee).expect(204)

      const user = await User.findOne({ _id: invitee._id }).lean()
      expect(user).not.null
      expect(user.homeId).eql(homeA._id).eql(inviter._id)
      const nInvitations = await Invitation.countDocuments({
        _id: { $in: [invitationA._id, invitationB._id] }
      })
      expect(nInvitations).eq(0)
    })
  })

  describe('Failure', () => {
    it('Returns 400 when the id is invalid', async() => {
      const user = await G.newUser()

      await G.request(`delete /invitation/zporf/accept`, user).expect(400)
    })

    it('Returns 404 when the invitation does not exists', async() => {
      const user = await G.newUser()

      await G.request(`delete /invitation/${user._id}/accept`, user).expect(404)
    })

    it('Returns 404 when the invitation does not target the sender', async() => {
      const home = await G.newHome()
      const [someone, inviter, invitee] = await Promise.all([
        G.newUser(), G.newUser({ homeId: home._id }), G.newUser()
      ])
      const invitation = await G.newInvitation(
        { inviterId: inviter._id, homeId: home._id, inviteeId: invitee._id }
      )

      await G.request(`delete /invitation/${invitation._id}/accept`, someone).expect(404)
    })

    it('Returns 424 when the inviter does not exists', async() => {
      const [home, invitee] = await Promise.all([G.newHome(), G.newUser()])
      const invitation = await G.newInvitation({
        inviterId: new ObjectId(), homeId: home._id, inviteeId: invitee._id
      })

      const { body } = await G.request(`delete /invitation/${invitation._id}/accept`, invitee)
        .expect(424)
      expect(body.error.message).eq('inviter')
    })
  })
})
