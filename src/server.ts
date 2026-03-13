import 'reflect-metadata'
import dotenv from 'dotenv'
// Load env vars before importing anything else
dotenv.config()

import app from './app'
import connectDB from './config/database'

const PORT = process.env.PORT || 3000

// Connect to Database
connectDB()

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, promise) => {
  console.log(`Error: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})
