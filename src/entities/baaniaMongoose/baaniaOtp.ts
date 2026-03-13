import mongoose from 'mongoose'

export const mongooseOtpSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  phone: { type: String, required: true },
  ref_no: { type: String, required: true },
  otp: { type: String, required: true },
  otp_expires: { type: Date, required: true },
  is_validated: { type: Boolean, required: true }
})
