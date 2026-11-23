import mongoose from 'mongoose'
import Unittype from '../models/Unittype'
import ProjectRead from '../models/ProjectRead'
import { PaginationOptions, PaginationMeta } from '../interfaces/pagination'

/** Result of syncing a unittype into its parent project's data.unittype[]. */
export interface ProjectSyncResult {
  attempted: boolean // was a project_keyId present to sync against
  matched: number // project documents matched
  modified: number // project documents actually modified
  mode?: 'push' | 'update'
  error?: string // best-effort: sync never throws, errors are reported here
}

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
   * Build the compact unittype entry stored inside a project's data.unittype[].
   * Maps the unittype document onto the project's embedded unittype shape.
   */
  private static buildProjectUnittypeEntry(u: any): Record<string, any> {
    const d = u?.data || {}
    return {
      unittype_keyId: u?.keyId,
      id: d.id,
      title: d.info?.title_th,
      title_alt: d.info?.title_alt,
      published: d.published,
      price_start: d.financial?.price_start,
      not_show_start_price: d.financial?.not_show_start_price,
      start_price_not_found: d.financial?.start_price_not_found,
      num_bed: d.detail?.num_bed,
      num_bath: d.detail?.num_bath,
      num_parking: d.detail?.num_parking,
      num_floor: d.detail?.num_floor,
      area_usable: d.detail?.area_usable,
      area_land: d.detail?.area_land,
      image: d.images?.main,
      url: d.url
    }
  }

  /**
   * Sync a unittype into its parent project's data.unittype[].
   *   - mode 'push'   : append the entry (create flow)
   *   - mode 'update' : replace the matching entry (by unittype_keyId); if the
   *                     project has no such entry yet, it is pushed instead.
   * The parent project is located by `data.project.project_keyId` matched
   * against the project's `keyId` or `data.id`.
   *
   * Best-effort: never throws. Any failure is captured in `error` so the
   * primary unittype write is not rolled back by a project-sync problem.
   * Note: this is two separate writes (not an atomic transaction).
   */
  private static async syncToProject(u: any, mode: 'push' | 'update'): Promise<ProjectSyncResult> {
    const projectKey = u?.data?.project?.project_keyId
    if (!projectKey) {
      return { attempted: false, matched: 0, modified: 0 }
    }

    const entry = this.buildProjectUnittypeEntry(u)
    const nowSec = Math.floor(Date.now() / 1000)
    const projectFilter = { $or: [{ keyId: projectKey }, { 'data.id': projectKey }] }
    // Flag the project as changed so downstream consumers re-pick it up.
    const touch = { isShouldUpdate: 1, updated: nowSec, 'data.updated': nowSec }

    try {
      if (mode === 'update') {
        // 1) Try to replace the existing array element in place.
        const r = await ProjectRead.updateOne(
          { ...projectFilter, 'data.unittype.unittype_keyId': u.keyId },
          { $set: { 'data.unittype.$': entry, ...touch } }
        )
        if (r.matchedCount > 0) {
          return {
            attempted: true,
            matched: r.matchedCount,
            modified: r.modifiedCount,
            mode: 'update'
          }
        }
        // 2) No existing element -> fall through to push.
      }

      const r = await ProjectRead.updateOne(projectFilter, {
        $push: { 'data.unittype': entry },
        $set: touch
      })
      return { attempted: true, matched: r.matchedCount, modified: r.modifiedCount, mode: 'push' }
    } catch (error: any) {
      return { attempted: true, matched: 0, modified: 0, mode, error: error.message }
    }
  }

  /**
   * Validate and create a new unittype document, then append it to the parent
   * project's data.unittype[] (best-effort).
   */
  public static async createUnittype(
    payload: UnittypePayload
  ): Promise<
    | { success: true; data: any; projectSync: ProjectSyncResult }
    | { success: false; validation: UnittypeValidationResult }
  > {
    const validation = this.validate(payload, false)
    if (!validation.valid) {
      return { success: false, validation }
    }

    const document = this.transformToDocument(payload, false)
    const saved = await new Unittype(document).save()
    const projectSync = await this.syncToProject(saved, 'push')
    return { success: true, data: saved, projectSync }
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
   * Fetch a single unittype by its MongoDB _id, or fall back to keyId.
   * (embedded project.unittype[] references use unittype_keyId, which may be
   * a non-ObjectId string such as "unittype_50059".)
   */
  public static async getUnittypeById(id: string) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const byId = await Unittype.findById(id)
      if (byId) return byId
    }
    return await Unittype.findOne({ keyId: id, deletedAt: { $eq: null } })
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
    | { success: true; data: any; projectSync?: ProjectSyncResult }
    | { success: false; validation: UnittypeValidationResult }
  > {
    const validation = this.validate(payload, true)
    if (!validation.valid) {
      return { success: false, validation }
    }

    const updateData = this.transformToDocument(payload, true)
    const updated = await Unittype.findByIdAndUpdate(id, updateData, { new: true })
    if (!updated) {
      return { success: true, data: null }
    }

    // Mirror the change into the parent project's data.unittype[].
    const projectSync = await this.syncToProject(updated, 'update')
    return { success: true, data: updated, projectSync }
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
