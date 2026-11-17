import mongoose from 'mongoose'

/**
 * Developers is a large, loosely-structured collection sourced from the
 * external Baania system. Only `_id` is strongly typed; the nested `data`
 * object and the timestamp/key fields vary, so `strict: false` lets us read
 * and WRITE the full document without Mongoose stripping unknown paths.
 *
 * `minimize: false` keeps empty objects (e.g. empty `data.image`) instead of
 * silently dropping them.
 */
export const mongooseDevelopersSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    data: { type: mongoose.Schema.Types.Mixed },
    created: { type: Number },
    updated: { type: Number },
    updatedAt: { type: Date },
    keyId: { type: String }
  },
  { strict: false, minimize: false }
)
