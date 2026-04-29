import { dbRead } from '../config/database';
import { mongooseProjectReadSchema } from '../entities/baaniaMongoose/projectRead';

const ProjectRead = dbRead.model('projects', mongooseProjectReadSchema, 'projects');

export default ProjectRead;
