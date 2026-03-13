import mongoose from 'mongoose'

export const mongooseUserLogSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    header: { type: String, required: true },
    body: { type: String, required: true },
    ssoId: { type: String, required: false },

    created_at: { type: Date, required: true },
    log_type: { type: String, required: true },
    description: { type: String, required: true },
    response: { type: String, required: true },
    updated_by: { type: String, required: false },

    log_by: { type: String, required: false },
    credit_log: { type: Object, required: true }
  },
  { versionKey: false }
)
