import { Document, Schema } from 'mongoose'
import { dataDb } from '../config/database'

export interface ILog extends Document {
  header: string
  body: string
  ssoId?: string | null
  log_type: string
  description: string
  response: string
  credit_log: any
  created_at: Date
}

const LogSchema: Schema = new Schema(
  {
    header: { type: String, required: true },
    body: { type: String, required: true },
    ssoId: { type: String },
    log_type: { type: String, required: true },
    description: { type: String, required: true },
    response: { type: String, required: true },
    credit_log: { type: Schema.Types.Mixed }, // Mongoose equivalent to 'any'
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  },
)

export default dataDb.model<ILog>('Log', LogSchema)
