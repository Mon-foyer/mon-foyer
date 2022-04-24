import { Home } from '../../models.mjs'

export async function controller(req, res, user) {
  const [home] = await Home.aggregate([
    { $match: { _id: user.homeId } },
    { $lookup: { from: 'users', as: 'inhabitants', localField: '_id', foreignField: 'homeId' } },
    {
      $project: {
        'inhabitants.homeId': 0,
        'inhabitants.password': 0,
        'inhabitants.token': 0
      }
    }
  ])
  res.status(200).send(home)
}
