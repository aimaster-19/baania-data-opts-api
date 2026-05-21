import mongoose, { Document, Schema } from 'mongoose'
// import bcrypt from 'bcryptjs'
// import { dataDb } from '../config/database'

export interface IAgreement {
  email?: {
    news?: number
  }
  term?: {
    pdpa?: number
    pdpa_timestamp?: string
  }
}

export interface IUser extends Document {
  ssoId?: string
  image?: string
  mobile?: string
  uid?: string
  name: string
  email: string
  password?: string // Optional for SSO, required for local auth
  role: string
  personalID?: string
  last_sign_on?: string | Date
  register_question?: boolean
  contact_line?: string
  mobile_reserve?: string
  listing_count?: number
  listing_online_count?: number
  account_type?: string
  credit?: number
  agreement?: IAgreement
  refreshTokens: string | null
  created_at: Date
  updated_at: Date
  matchPassword(enteredPassword: string): Promise<boolean>
}

// const AgreementSchema = new Schema(
//   {
//     email: {
//       news: { type: Number, default: 0 }
//     },
//     term: {
//       pdpa: { type: Number, default: 0 },
//       pdpa_timestamp: { type: String }
//     }
//   },
//   { _id: false }
// )

// const UserSchema: Schema = new Schema(
//   {
//     ssoId: { type: String, trim: true },
//     image: { type: String },
//     mobile: { type: String },
//     uid: { type: String },
//     name: {
//       type: String,
//       required: [true, 'Please add a name']
//     },
//     email: {
//       type: String,
//       required: [true, 'Please add an email'],
//       unique: true,
//       match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
//     },
//     password: {
//       type: String,
//       minlength: 6,
//       select: false // Don't return password by default
//     },
//     role: {
//       type: String,
//       enum: ['user', 'admin'],
//       default: 'user'
//     },
//     personalID: { type: String },
//     last_sign_on: { type: Date },
//     register_question: { type: Boolean, default: false },
//     contact_line: { type: String },
//     mobile_reserve: { type: String },
//     listing_count: { type: Number, default: 0 },
//     listing_online_count: { type: Number, default: 0 },
//     account_type: { type: String },
//     credit: { type: Number, default: 0 },
//     agreement: { type: AgreementSchema },
//     refreshTokens: { type: String, default: null }
//   },
//   {
//     timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
//   }
// )

// // Encrypt password using bcrypt
// UserSchema.pre<IUser>('save', async function (next) {
//   if (!this.isModified('password') || !this.password) {
//     return next()
//   }

//   const salt = await bcrypt.genSalt(10)
//   this.password = await bcrypt.hash(this.password, salt)
// })

// // Match user entered password to hashed password in database
// UserSchema.methods.matchPassword = async function (enteredPassword: string) {
//   if (!this.password) return false
//   return await bcrypt.compare(enteredPassword, this.password)
// }

// export default dataDb.model<IUser>('User', UserSchema)
