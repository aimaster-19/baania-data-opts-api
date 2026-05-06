import { dbRead } from '../config/database'
import { mongooseSubDistrictsSchema } from '../entities/baaniaMongoose/subdistricts'

const Subdistricts = dbRead.model('subdistricts', mongooseSubDistrictsSchema)

export default Subdistricts
