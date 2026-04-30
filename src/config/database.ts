import mongoose from 'mongoose'
import { DataSource } from 'typeorm'
import { Admin } from '../entities/postgres/Admin'
import { Banner } from '../entities/postgres/Banner'
import { BannerGroup } from '../entities/postgres/BannerGroup'
import { TrackingLog } from '../entities/postgres/TrackingLog'

// Create the connection for main data (CRUD MongoDB)
const dbRead = mongoose.createConnection(process.env.MONGODB_URI_READ as string)

// Create the AppDataSource for PostgreSQL (TypeORM)
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: false, // Temporarily enable to sync schema changes
  logging: false,
  entities: [Admin, Banner, BannerGroup, TrackingLog],
  subscribers: [],
  migrations: [],
  // Connection pool settings to prevent concurrent query issues
  poolSize: 10,
  maxQueryExecutionTime: 30000, // 30 seconds
  connectTimeoutMS: 30000
})

// Helper function to wait for connections to be established on server startup
const connectDB = async () => {
  try {
    // 1. Connect MongoDBs
    await Promise.all([dbRead.asPromise()])
    console.log(`MongoDB Connected: dbRead established`)

    // 2. Connect PostgreSQL via TypeORM
    await AppDataSource.initialize()
    console.log(`PostgreSQL Connected: AppDataSource established`)
  } catch (error: any) {
    console.error(`Error connecting to databases: ${error.message}`)
    process.exit(1)
  }
}

export { dbRead, AppDataSource }
export default connectDB
