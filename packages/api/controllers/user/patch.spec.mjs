import { expect } from 'chai'
import G from '../../generators.mjs'
import { Home, User } from '../../models.mjs'

describe('PATCH /user/:id', () => {
  after(() => G.empty())

  describe('Success', () => {
    it('Changes a user\'s shownName', async() => {
      const home = await G.newHome()
      const user = await G.newUser({ homeId: home._id, shownName: 'TheName' })

      await G.request(`patch /user`, user).send({ shownName: 'TheNewName' }).expect(204)

      const updatedUser = await User.findOne({ _id: user._id }).lean()

      expect(updatedUser.homeId).eql(home._id) // The user is still in its home
      expect(updatedUser.shownName).eq('TheNewName')
    })

    it('Allows a user to leave its home and delete the home when empty', async() => {
      const home = await G.newHome()
      const user = await G.newUser({ homeId: home._id, shownName: 'TheName' })

      await G.request(`patch /user`, user).send({ leaveHome: true }).expect(204)

      const updatedUser = await User.findOne({ _id: user._id }).lean()
      const [oldHome, newHome] = await Promise.all([
        Home.findOne({ _id: home._id }).lean(),
        Home.findOne({ _id: updatedUser.homeId }).lean()
      ])

      expect(oldHome).null // The home is now empty so its deleted
      expect(updatedUser.homeId).eql(newHome._id)
      expect(updatedUser.shownName).eq('TheName') // The user shownName did not changed
    })

    it('Allows a user to leave its home and keep the home when not empty', async() => {
      const home = await G.newHome()
      const [userA] = await Promise.all([
        G.newUser({ homeId: home._id }),
        G.newUser({ homeId: home._id })
      ])

      await G.request(`patch /user`, userA).send({ leaveHome: true }).expect(204)

      const updatedUser = await User.findOne({ _id: userA._id }).lean()
      const [oldHome, newHome] = await Promise.all([
        Home.findOne({ _id: home._id }).lean(),
        Home.findOne({ _id: updatedUser.homeId }).lean()
      ])

      expect(oldHome).not.null // The home is not empty, userB is still in, so its kept
      expect(updatedUser.homeId).eql(newHome._id) // userA home changed
    })

  })
})
