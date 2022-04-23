import { expect } from 'chai'
import G from '../../generators.mjs'
import { Invitation } from '../../models.mjs'

describe('POST /invitation', () => {
  after(() => G.empty())

  describe('Success', () => {
    it('Generates a new invitation', async() => {
      const home = await G.newHome()
      const [inviter, invitee] = await Promise.all([G.newUser({ homeId: home._id }), G.newUser()])
      const { headers } = await G.request(`post /invitation/`, inviter)
        .send({ name: invitee.name })
        .expect(201)
      const invitation = await Invitation.findOne(
        { inviterId: inviter._id, inviteeId: invitee._id }, { _id: 1 }
      ).lean()

      expect(headers.location).eq('/invitation/pendings')
      expect(invitation).not.null
    })
  })

  describe('Failure', () => {
    it('Returns 422 when the requester does not have a home', async() => {
      const requester = await G.newUser()
      const { body } = await G.request(`post /invitation/`, requester).send({ name: 'epfinge' })
        .expect(422)

      expect(body.error.message).eq('no_home')
    })

    it('Returns 422 when the user already has a pending invitation', async() => {
      const home = await G.newHome()
      const [inviter, invitee] = await Promise.all([G.newUser({ homeId: home._id }), G.newUser()])
      await G.newInvitation({ inviterId: inviter._id, homeId: inviter.homeId, inviteeId: invitee._id })
      const { body } = await G.request(`post /invitation/`, inviter).send({ name: invitee.name })
        .expect(422)

      expect(body.error.message).eq('too_many_invitation')
    })

    it('Returns 424 when the target user does not exists', async() => {
      const home2 = await G.newHome()
      const requester = await G.newUser({ homeId: home2._id })
      const { body } = await G.request(`post /invitation/`, requester)
        .send({ name: requester.name + requester.name })
        .expect(424)

      expect(body.error.message).eq('user')
    })

    it('Returns 422 when the user invites itself', async() => {
      const home4 = await G.newHome()
      const requester = await G.newUser({ homeId: home4._id })
      const { body } = await G.request(`post /invitation/`, requester)
        .send({ name: requester.name })
        .expect(422)

      expect(body.error.message).eq('invite_yourself')
    })

  })
})
