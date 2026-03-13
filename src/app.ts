import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import apiRoutes from './routes'
import { errorHandler } from './middlewares/errorMiddleware'

const app: Express = express()

// Security Middleware
app.use(helmet())

// CORS config
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
)

// Rate limiting to prevent brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: 'Too many requests from this IP, please try again after 15 minutes',
})
app.use('/api', limiter)

// Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie Parser
app.use(cookieParser())

// Routes
// Separated API routes mounted at /api
app.use('/api', apiRoutes)

// Base route test
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Data Opts API!' })
})

// Error handling middleware
app.use(errorHandler)

export default app
