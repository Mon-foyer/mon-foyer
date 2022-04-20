import { expect } from 'chai'
import G from '../../generators.mjs'
import { Invitation } from '../../models.mjs'

describe('POST /invitation', () => {
  after(() => G.empty())

  describe('Success', () => {
    it('Generates a new invitation', async() => {
      const home3 = await G.newHome()
      const [requester, user6] = await Promise.all([G.newUser({ homeId: home3._id }), G.newUser()])
      const { headers } = await G.request(`post /invitation/`, requester)
        .send({ name: user6.name })
        .expect(201)
      const invitation = await Invitation.findOne(
        { fromId: requester._id, toId: user6._id }, { _id: 1 }
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
      const home1 = await G.newHome()
      const [requester, user3] = await Promise.all([G.newUser({ homeId: home1._id }), G.newUser()])
      await G.newInvitation({ fromId: requester._id, toId: user3._id })
      const { body } = await G.request(`post /invitation/`, requester).send({ name: user3.name })
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
