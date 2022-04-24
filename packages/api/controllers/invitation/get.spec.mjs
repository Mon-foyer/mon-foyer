import { expect } from 'chai'
import G from '../../generators.mjs'

describe('GET /invitation', () => {
  after(() => G.empty())

  describe('Sucesses', () => {
    it('Gets an empty array when a user has no invitation', async() => {
      const requester = await G.newUser()

      const { body } = await G.request(`get /invitation`, requester).expect(200)

      expect(body).an('array').lengthOf(0)
    })

    it('Gets pending invitations', async() => {
      const [home1, home2] = await Promise.all([G.newHome(), G.newHome()])
      const [user1, user2, user3] = await Promise.all([
        G.newUser({ homeId: home1._id, name: 'AAA' }),
        G.newUser({ homeId: home2._id, name: 'BBB' }),
        G.newUser()
      ])
      const [i1, i2] = await Promise.all([
        G.newInvitation({ homeId: home1._id, inviterId: user1._id, inviteeId: user3._id }),
        G.newInvitation({ homeId: home2._id, inviterId: user2._id, inviteeId: user1._id })
      ])

      const { body } = await G.request(`get /invitation`, user1).expect(200)

      expect(body).an('array').lengthOf(2)
      body.sort((a, b) => a.inviter.name.localeCompare(b.inviter.name))
      expect(body[0]).keys('_id', 'createdAt', 'home', 'invitee', 'inviter')
      expect(body[0]._id).eq(i1._id.toString())
      expect(body[0].home).eql({ _id: home1._id.toString(), name: home1.name })
      expect(body[0].invitee).eql({ _id: user3._id.toString(), name: user3.name })
      expect(body[0].inviter).eql({ _id: user1._id.toString(), name: user1.name })
      expect(body[1]).keys('_id', 'createdAt', 'home', 'invitee', 'inviter')
      expect(body[1]._id).eq(i2._id.toString())
      expect(body[1].home).eql({ _id: home2._id.toString(), name: home2.name })
      expect(body[1].invitee).eql({ _id: user1._id.toString(), name: user1.name })
      expect(body[1].inviter).eql({ _id: user2._id.toString(), name: user2.name })
    })
  })
})
