import mongoose from 'mongoose'

export const mongooseUserSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    header: { type: String, required: true },
    body: { type: String, required: true },
    ssoId: { type: String, required: true },
    created_at: { type: Date, required: true },
    log_type: { type: String, required: true },
    description: { type: String, required: true },
    response: { type: String, required: true }
  },
  { versionKey: false }
)
