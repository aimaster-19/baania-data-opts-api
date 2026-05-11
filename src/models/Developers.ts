import { dbRead } from '../config/database'
import { mongooseDevelopersSchema } from '../entities/baaniaMongoose/developers'

const Developers = dbRead.model('developers', mongooseDevelopersSchema)

export default Developers
