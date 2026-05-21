import { mongoosePropertyTypeSchema } from '../entities/baaniaMongoose/propertyType'
import { dbRead } from '../config/database'

const PropertyType = dbRead.model('properties_type', mongoosePropertyTypeSchema, 'properties_type')

export default PropertyType
