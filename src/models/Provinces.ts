import { dbRead } from '../config/database'
import { mongooseProvincesSchema } from '../entities/baaniaMongoose/provinces'

const Provinces = dbRead.model('provinces', mongooseProvincesSchema)

export default Provinces
