import { dbRead } from '../config/database'
import { mongooseDistrictsSchema } from '../entities/baaniaMongoose/districts'

const District = dbRead.model('districts', mongooseDistrictsSchema)

export default District
