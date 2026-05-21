import mongoose from 'mongoose'

/**
 * DTO: Structure matching the JSON payload for Project.
 * Supports both Create and Update operations.
 */
export interface ProjectPayloadDTO {
  data?: {
    address?: Record<string, any>
    ads?: Record<string, any>
    detail?: Record<string, any>
    developer?: Record<string, any>
    email?: string
    facebook?: string
    facility?: Record<string, any>
    financial?: Record<string, any>
    footnote?: Record<string, any>
    general?: Record<string, any>
    id?: string
    images?: Record<string, any>
    info?: {
      search_keyword?: string
      code?: string
      hasBlogic?: boolean
      posted?: string
      title_th?: string
      title_en?: string
    }
    line?: string
    location?: {
      heading?: string
      bottom?: string
      lon?: number
      right?: string
      top?: string
      left?: string
      lat?: number
    }
    meta?: Record<string, any>
    progress?: Record<string, any>
    promote?: Record<string, any>
    property_type?: any[]
    published?: number
    selloffice?: Record<string, any>
    transaction?: any[]
    uid?: string
    unittype?: any[]
    url?: Record<string, any>
    video?: Record<string, any>
    website?: string
    exreview?: string
    livingscore?: string
  }
  geopoint?: {
    coordinates?: number[]
    type?: string
  }
  isShouldUpdate?: number | string
  deletedAt?: string | null
}

// Alias for backwards compatibility with existing imports
export type CreateProjectDTO = ProjectPayloadDTO

export interface ValidationResult {
  valid: boolean
  errors: { field: string; message: string }[]
}

/**
 * Basic, professional validation for the Project JSON payload.
 * Supports differentiating between Create (isUpdate = false) and Update (isUpdate = true).
 */
export function validateProjectPayload(dto: ProjectPayloadDTO, isUpdate = false): ValidationResult {
  const errors: ValidationResult['errors'] = []

  if (!isUpdate) {
    // ── Create Operation Validation ──
    // Require at least a title in Thai or English
    if (!dto.data?.info?.title_th?.trim() && !dto.data?.info?.title_en?.trim()) {
      errors.push({
        field: 'data.info.title_th',
        message: 'กรุณาระบุชื่อโครงการอย่างน้อย 1 ภาษา (ไทยหรืออังกฤษ)'
      })
    }

    // Require location coordinates for new projects
    if (dto.data?.location) {
      const { lat, lon } = dto.data.location
      if (lat === undefined || lon === undefined) {
        errors.push({
          field: 'data.location',
          message: 'กรุณาระบุพิกัดละติจูดและลองจิจูด (lat, lon)'
        })
      }
    } else {
      errors.push({
        field: 'data.location',
        message: 'ข้อมูลพิกัดที่ตั้ง (location) เป็นสิ่งจำเป็น'
      })
    }
  }

  // ── Common Validation (Create & Update) ──

  // Validate location coordinates boundaries if they are provided
  if (dto.data?.location) {
    const { lat, lon } = dto.data.location
    if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      errors.push({ field: 'data.location.lat', message: 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90' })
    }
    if (lon !== undefined && (isNaN(lon) || lon < -180 || lon > 180)) {
      errors.push({ field: 'data.location.lon', message: 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180' })
    }
  }

  // Validate geopoint coordinates if provided
  if (dto.geopoint?.coordinates && dto.geopoint.coordinates.length === 2) {
    const [lon, lat] = dto.geopoint.coordinates
    if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      errors.push({
        field: 'geopoint.coordinates',
        message: 'ละติจูดของ geopoint ต้องอยู่ระหว่าง -90 ถึง 90'
      })
    }
    if (lon !== undefined && (isNaN(lon) || lon < -180 || lon > 180)) {
      errors.push({
        field: 'geopoint.coordinates',
        message: 'ลองจิจูดของ geopoint ต้องอยู่ระหว่าง -180 ถึง 180'
      })
    }
  }

  return { valid: errors.length === 0, errors }
}

// Alias for backwards compatibility with existing imports
export const validateCreateProject = (dto: ProjectPayloadDTO) => validateProjectPayload(dto, false)

/**
 * Transforms the JSON payload to perfectly align with the MongoDB document structure.
 * Supports both creating new documents and formatting update payloads.
 */
export function transformToDocument(dto: ProjectPayloadDTO, isUpdate = false): Record<string, any> {
  const now = Date.now()
  const isoDate = new Date().toISOString()

  // Clone to prevent mutating the original request payload
  const document: Record<string, any> = JSON.parse(JSON.stringify(dto))

  if (!isUpdate) {
    // ── Create specific fields ──
    const keyId = new mongoose.Types.ObjectId().toHexString()
    document._id = new mongoose.Types.ObjectId()
    document.keyId = keyId
    document.created = isoDate
    document.updated = isoDate

    // Ensure 'data' object exists
    if (!document.data) {
      document.data = {}
    }
    document.data.created = now
    document.data.updated = now

    // Initialize required internal logic fields if missing
    if (!document.data.info) document.data.info = {}
    if (!document.data.info.code) {
      document.data.info.code = keyId.slice(-8).toUpperCase()
    }
    if (!document.data.info.posted) {
      document.data.info.posted = isoDate
    }
  } else {
    // ── Update specific fields ──
    document.updated = isoDate
    if (document.data) {
      document.data.updated = now
    }
    // Prevent overriding unchangeable fields during update
    delete document._id
    delete document.keyId
    delete document.created
    if (document.data) {
      delete document.data.created
    }
  }

  // ── Sync Geopoint with Location ──
  // If location is provided but geopoint is not set properly, automatically generate the GeoJSON Point
  if (document.data?.location?.lat !== undefined && document.data?.location?.lon !== undefined) {
    if (
      !document.geopoint ||
      !document.geopoint.coordinates ||
      document.geopoint.coordinates.length !== 2
    ) {
      document.geopoint = {
        type: 'Point',
        coordinates: [document.data.location.lon, document.data.location.lat]
      }
    }
  }

  // ── Final Formatting ──
  // Ensure isShouldUpdate is a string for Mongoose schema compatibility
  if (document.isShouldUpdate === undefined) {
    document.isShouldUpdate = isUpdate ? '1' : '0'
  } else {
    document.isShouldUpdate = String(document.isShouldUpdate)
  }

  return document
}
