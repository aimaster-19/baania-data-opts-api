import Developers from '../models/Developers'
import mongoose, { FilterQuery } from 'mongoose'
import { escapeRegex } from '../utils/escapeRegex'

export interface DeveloperPayload {
  data?: Record<string, any>
  keyId?: string
}

export interface DeveloperValidationResult {
  valid: boolean
  errors: { field: string; message: string }[]
}

export default class DevelopersService {
  public static async getDevelopers({
    title_th,
    limit
  }: {
    title_th?: string
    limit?: number
  }): Promise<any> {
    try {
      const filterOption: FilterQuery<any> = {}
      if (title_th) {
        // ค้นหาแบบ contains (ไม่ anchor หัว) เพื่อให้หาคำกลาง/คำท้ายเจอ
        filterOption['data.title'] = {
          $regex: escapeRegex(title_th),
          $options: 'i'
        }
      }
      const developers = await Developers.find(filterOption)
        .sort({ 'data.title': 'asc' })
        .limit(limit || 10)
      return developers
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * Validate a developer payload.
   * Requires a `data` object with at least a title or display_name.
   */
  public static validate(payload: DeveloperPayload, isUpdate = false): DeveloperValidationResult {
    const errors: DeveloperValidationResult['errors'] = []

    if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      errors.push({ field: 'data', message: 'ต้องระบุ data เป็น object' })
      return { valid: false, errors }
    }

    if (!isUpdate) {
      const title = (payload.data.title || payload.data.display_name || '').toString().trim()
      if (!title) {
        errors.push({
          field: 'data.title',
          message: 'กรุณาระบุชื่อผู้พัฒนา (data.title หรือ data.display_name)'
        })
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Create a new developer document following the Baania structure:
   *   { _id, data, keyId, created, updated, updatedAt }
   * - created/updated are epoch SECONDS (matching existing data)
   * - updatedAt is a Date
   * - keyId is the _id string itself (unique, no race), unless the payload
   *   supplies one explicitly. `data.id` is aligned to the _id when not
   *   provided.
   */
  public static async createDeveloper(payload: DeveloperPayload) {
    const nowSec = Math.floor(Date.now() / 1000)
    const _id = new mongoose.Types.ObjectId()
    const idHex = _id.toHexString()

    const data: Record<string, any> = { ...(payload.data || {}) }
    if (!data.id) data.id = idHex

    const doc = new Developers({
      _id,
      data,
      keyId: payload.keyId || idHex,
      created: nowSec,
      updated: nowSec,
      updatedAt: new Date()
    })

    return await doc.save()
  }

  /**
   * Update a developer by _id. Replaces the `data` object and bumps the
   * update timestamps. `keyId` and `created` are left unchanged.
   * Returns the updated document, or null when the id does not exist.
   */
  public static async updateDeveloper(id: string, payload: DeveloperPayload) {
    const nowSec = Math.floor(Date.now() / 1000)
    const update: Record<string, any> = {
      updated: nowSec,
      updatedAt: new Date()
    }
    if (payload.data) update.data = payload.data
    if (payload.keyId) update.keyId = payload.keyId

    return await Developers.findByIdAndUpdate(id, { $set: update }, { new: true })
  }
}
