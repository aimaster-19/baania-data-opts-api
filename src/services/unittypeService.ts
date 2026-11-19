import mongoose from 'mongoose'
import Unittype from '../models/Unittype'
import { PaginationOptions, PaginationMeta } from '../interfaces/pagination'

export interface UnittypePayload {
  data?: Record<string, any>
  keyId?: string
  geopoint?: { coordinates?: number[]; type?: string }
  isShouldUpdate?: number | string
}

export interface UnittypeValidationResult {
  valid: boolean
  errors: { field: string; message: string }[]
}

/**
 * Fields selected for the list view to keep payloads small. The full unittype
 * document embeds an entire project snapshot, so the list only returns what a
 * table/card UI needs.
 */
const LIST_SELECT_FIELDS: Record<string, 1> = {
  _id: 1,
  keyId: 1,
  created: 1,
  updated: 1,
  'data.published': 1,
  'data.info.title_th': 1,
  'data.info.title_en': 1,
  'data.financial.price_start': 1,
  'data.detail.num_bed': 1,
  'data.detail.num_bath': 1,
  'data.detail.area_usable': 1,
  'data.images.main.thumbnail': 1,
  'data.address.province_th': 1,
  'data.project.project_keyId': 1,
  'data.project.title_th': 1,
  'data.project.code': 1
}

export class UnittypeService {
  /**
   * Validate an incoming unittype payload.
   * Requires a `data` object with at least a title (th or en).
   */
  public static validate(payload: UnittypePayload, isUpdate = false): UnittypeValidationResult {
    const errors: UnittypeValidationResult['errors'] = []

    if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      errors.push({ field: 'data', message: 'ต้องระบุ data เป็น object' })
      return { valid: false, errors }
    }

    if (!isUpdate) {
      const title = (payload.data.info?.title_th || payload.data.info?.title_en || '')
        .toString()
        .trim()
      if (!title) {
        errors.push({
          field: 'data.info.title_th',
          message: 'กรุณาระบุชื่อยูนิตไทป์ (data.info.title_th หรือ title_en)'
        })
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Transform a payload into a stored document that matches the pipeline shape.
   * Timestamps are epoch SECONDS (number); isShouldUpdate is numeric.
   */
  private static transformToDocument(
    payload: UnittypePayload,
    isUpdate = false
  ): Record<string, any> {
    const nowSec = Math.floor(Date.now() / 1000)
    const document: Record<string, any> = JSON.parse(JSON.stringify(payload))

    if (!isUpdate) {
      const _id = new mongoose.Types.ObjectId()
      const idHex = _id.toHexString()
      document._id = _id
      // keyId is the _id hex unless explicitly supplied (unique, no race).
      document.keyId = payload.keyId || idHex
      document.created = nowSec
      document.updated = nowSec

      if (!document.data) document.data = {}
      if (!document.data.id) document.data.id = document.keyId
      document.data.created = nowSec
      document.data.updated = nowSec
    } else {
      document.updated = nowSec
      if (document.data) document.data.updated = nowSec
      // Never let an update change identity/creation fields.
      delete document._id
      delete document.keyId
      delete document.created
      if (document.data) delete document.data.created
    }

    // Sync geopoint from data.location when present and not already set.
    const lat = document.data?.location?.lat
    const lon = document.data?.location?.lon
    if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
      if (!document.geopoint || !Array.isArray(document.geopoint.coordinates)) {
        document.geopoint = { type: 'Point', coordinates: [lon, lat] }
      }
    }

    // Numeric dirty-flag (0 | 1), matching the pipeline.
    if (document.isShouldUpdate === undefined) {
      document.isShouldUpdate = isUpdate ? 1 : 0
    } else {
      document.isShouldUpdate = Number(document.isShouldUpdate)
    }

    // Active records keep deletedAt = null (list filter matches { $eq: null }).
    if (
      document.deletedAt === undefined ||
      document.deletedAt === '' ||
      (typeof document.deletedAt === 'string' && document.deletedAt.trim() === '')
    ) {
      document.deletedAt = null
    }

    return document
  }

  /**
   * Validate and create a new unittype document.
   */
  public static async createUnittype(
    payload: UnittypePayload
  ): Promise<
    { success: true; data: any } | { success: false; validation: UnittypeValidationResult }
  > {
    const validation = this.validate(payload, false)
    if (!validation.valid) {
      return { success: false, validation }
    }

    const document = this.transformToDocument(payload, false)
    const saved = await new Unittype(document).save()
    return { success: true, data: saved }
  }

  /**
   * Paginated list with filter + sort. Runs count + find in parallel.
   */
  public static async getPaginatedUnittypes(options: PaginationOptions) {
    const { page, limit, filter, sort, select } = options
    const skip = (page - 1) * limit
    const selectedFields = select || LIST_SELECT_FIELDS

    const [total, data] = await Promise.all([
      Unittype.countDocuments(filter),
      Unittype.find(filter).select(selectedFields).sort(sort).skip(skip).limit(limit).lean()
    ])

    const totalPages = Math.ceil(total / limit)
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    return { data, pagination }
  }

  /**
   * Fetch a single unittype by its MongoDB _id.
   */
  public static async getUnittypeById(id: string) {
    return await Unittype.findById(id)
  }

  /**
   * Validate and update a unittype by _id. The `data` object is replaced and
   * update timestamps are bumped; identity fields (_id, keyId, created) are
   * preserved. `data` is null in the result when the id does not exist.
   */
  public static async updateUnittype(
    id: string,
    payload: UnittypePayload
  ): Promise<
    { success: true; data: any } | { success: false; validation: UnittypeValidationResult }
  > {
    const validation = this.validate(payload, true)
    if (!validation.valid) {
      return { success: false, validation }
    }

    const updateData = this.transformToDocument(payload, true)
    const updated = await Unittype.findByIdAndUpdate(id, updateData, { new: true })
    return { success: true, data: updated }
  }

  /**
   * Soft-delete a unittype by _id. The document is kept but flagged so it is
   * excluded from the list view (which filters on deletedAt: null):
   *   - deletedAt      -> epoch seconds (marks the record as deleted)
   *   - isShouldUpdate -> 1 (numeric flag, matches the pipeline)
   *   - data.published -> 0 (unpublish)
   *   - updated / data.updated -> current timestamp (epoch seconds)
   * Returns the updated document, or null when the id does not exist.
   */
  public static async deleteUnittype(id: string) {
    const nowSec = Math.floor(Date.now() / 1000)
    return await Unittype.findByIdAndUpdate(
      id,
      {
        $set: {
          deletedAt: nowSec,
          isShouldUpdate: 1,
          'data.published': 0,
          updated: nowSec,
          'data.updated': nowSec
        }
      },
      { new: true }
    )
  }
}
