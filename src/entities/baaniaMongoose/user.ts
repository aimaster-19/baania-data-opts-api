import mongoose from 'mongoose'

export const mongooseUserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  mobile: { type: String, required: true },
  ssoId: { type: String, required: true },
  lastSignOn: { type: Date, required: true },
  personalId: { type: String, required: true },
  uid: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  mobile_reserve: { type: String, required: true },
  listing_count: { type: Number, required: true },
  listing_online_count: { type: Number, required: true },
  account_type: { type: String, required: true },
  credit: { type: Number, required: true }
})
