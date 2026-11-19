import { dbRead } from '../config/database'
import { mongooseUnittypeSchema } from '../entities/baaniaMongoose/unittype'

// Explicit collection name 'unittype' (matches the ProjectRead pattern).
const Unittype = dbRead.model('unittype', mongooseUnittypeSchema, 'unittype')

export default Unittype
