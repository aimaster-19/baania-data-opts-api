import mongoose from 'mongoose'

export const mongoosePromoteAdsSchema = new mongoose.Schema({
  started_at: Date,
  ended_at: Date,
  province: [Number],
  district: [Number],
  type: String,
  keyId: String,
  id_ref: String,
  sellState: String,
  position: [String],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: true
  }
})
