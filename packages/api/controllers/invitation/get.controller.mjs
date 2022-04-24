import { Invitation } from '../../models.mjs'

export async function controller(req, res, user) {
  res.status(200).send(await Invitation.aggregate([
    { $match: { $or: [{ inviteeId: user._id }, { inviterId: user._id }] } },
    { $lookup: { as: 'homes',    from: 'homes', localField: 'homeId',    foreignField: '_id' } },
    { $lookup: { as: 'inviters', from: 'users', localField: 'inviterId', foreignField: '_id' } },
    { $lookup: { as: 'invitees', from: 'users', localField: 'inviteeId', foreignField: '_id' } },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        home: { _id: '$homeId', name: { $first: '$homes.name' } },
        invitee: { _id: '$inviteeId', name: { $first: '$invitees.name' } },
        inviter: { _id: '$inviterId', name: { $first: '$inviters.name' } }
      }
    }
  ]))
}
