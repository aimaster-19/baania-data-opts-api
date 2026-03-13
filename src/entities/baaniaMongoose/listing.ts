import mongoose from 'mongoose'

export const mongooseListingSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ssoId: String,
  is_publish: Number,
  is_success: Number
})
