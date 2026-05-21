import { dbRead } from '../config/database'
import { mongooseProjectReadSchema } from '../entities/baaniaMongoose/projectRead'

const ProjectRead = dbRead.model('project', mongooseProjectReadSchema, 'project')

export default ProjectRead
