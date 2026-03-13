import mongoose from 'mongoose'

export const mongooseBrokerSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  data: { type: Object, required: true },
  isBroker: { type: Boolean, required: true },
  keyId: { type: String, required: true },
  new_brokers: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
})
