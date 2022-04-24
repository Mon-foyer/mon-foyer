import Joi from 'joi'
import JoiObjectId from 'joi-objectid'
Joi.objectId = JoiObjectId(Joi)

export default {
  object: keys => Joi.object(keys),

  id: Joi.objectId(),
  name: Joi.string().min(1),
  password: Joi.string().min(1)
}
