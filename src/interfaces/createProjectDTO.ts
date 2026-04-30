import mongoose from 'mongoose'

/**
 * DTO: Flat, frontend-friendly shape for creating a project.
 * The API transforms this into the nested MongoDB schema structure.
 */
export interface CreateProjectDTO {
  // Matches the frontend FormData exactly
  name: string
  type: string
  address?: string
  city?: string
  coordinates?: string
  description?: string
  features?: string[]
  price?: string | number
  currency?: string
}

/**
 * Validation result returned to the frontend.
 */
export interface ValidationResult {
  valid: boolean
  errors: { field: string; message: string }[]
}

// ── Property type mapping ──────────────────────────────────────────────

interface PropertyTypeEntry {
  id: number
  title_th: string
  title_en: string
}

const PROPERTY_TYPE_MAP: Record<string, PropertyTypeEntry> = {
  house: { id: 1, title_th: 'บ้านเดี่ยว', title_en: 'Single House' },
  condo: { id: 2, title_th: 'คอนโดมิเนียม', title_en: 'Condominium' },
  townhouse: { id: 3, title_th: 'ทาวน์โฮม', title_en: 'Townhouse' },
  land: { id: 4, title_th: 'ที่ดิน', title_en: 'Land' }
}

// ── Facility mapping ───────────────────────────────────────────────────

const FACILITY_MAP: Record<
  string,
  { key: string; infoKey: string; type: 'number' | 'string' }
> = {
  สระว่ายน้ำ: { key: 'has_pool', infoKey: 'info_pool', type: 'number' },
  ฟิตเนส: { key: 'has_fitness', infoKey: 'info_fitness', type: 'number' },
  สวนหย่อม: { key: 'has_park', infoKey: 'info_park', type: 'string' },
  'รปภ. 24 ชม.': {
    key: 'has_security',
    infoKey: 'info_security',
    type: 'string'
  },
  CCTV: { key: 'has_security', infoKey: 'info_security', type: 'string' },
  สนามเด็กเล่น: {
    key: 'has_playground',
    infoKey: 'info_playground',
    type: 'number'
  },
  ห้องประชุม: { key: 'has_meeting', infoKey: 'info_meeting', type: 'string' },
  คลับเฮาส์: { key: 'has_clubhouse', infoKey: 'info_clubhouse', type: 'number' }
}

// ── Validate ───────────────────────────────────────────────────────────

export function validateCreateProject(dto: CreateProjectDTO): ValidationResult {
  const errors: ValidationResult['errors'] = []

  if (!dto.name || typeof dto.name !== 'string' || !dto.name.trim()) {
    errors.push({ field: 'name', message: 'กรุณากรอกชื่อโครงการ' })
  } else if (dto.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'ชื่อโครงการต้องมีอย่างน้อย 2 ตัวอักษร'
    })
  }

  if (!dto.type || !PROPERTY_TYPE_MAP[dto.type]) {
    errors.push({
      field: 'type',
      message: `ประเภทโครงการไม่ถูกต้อง กรุณาเลือก: ${Object.keys(PROPERTY_TYPE_MAP).join(', ')}`
    })
  }

  if (dto.coordinates && typeof dto.coordinates === 'string') {
    const parts = dto.coordinates.split(',').map((p) => parseFloat(p.trim()))
    if (parts.length === 2) {
      const [lat, lon] = parts
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push({
          field: 'coordinates',
          message: 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90'
        })
      }
      if (isNaN(lon) || lon < -180 || lon > 180) {
        errors.push({
          field: 'coordinates',
          message: 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180'
        })
      }
    } else {
      errors.push({
        field: 'coordinates',
        message: 'รูปแบบพิกัดไม่ถูกต้อง (เช่น 13.75, 100.50)'
      })
    }
  }

  if (dto.price !== undefined && dto.price !== '') {
    const p = Number(dto.price)
    if (isNaN(p) || p < 0) {
      errors.push({
        field: 'price',
        message: 'ราคาเริ่มต้นต้องมากกว่าหรือเท่ากับ 0'
      })
    }
  }

  return { valid: errors.length === 0, errors }
}

// ── Transform ──────────────────────────────────────────────────────────

export function transformToDocument(
  dto: CreateProjectDTO
): Record<string, any> {
  const now = Date.now()
  const propertyType = PROPERTY_TYPE_MAP[dto.type]

  // Parse coordinates
  let lat = 0
  let lon = 0
  if (dto.coordinates) {
    const parts = dto.coordinates.split(',').map((p) => parseFloat(p.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      lat = parts[0]
      lon = parts[1]
    }
  }

  // Parse price
  const priceStart = dto.price ? Number(dto.price) : 0

  // Build facility object
  const facility: Record<string, any> = {}
  if (dto.features && dto.features.length > 0) {
    for (const feature of dto.features) {
      const mapping = FACILITY_MAP[feature]
      if (mapping) {
        // Apply the correct type required by the Mongoose schema
        facility[mapping.key] = mapping.type === 'number' ? 1 : '1'
        facility[mapping.infoKey] = feature
      }
    }
  }

  const keyId = new mongoose.Types.ObjectId().toHexString()
  const isoDate = new Date().toISOString()

  // Create document perfectly matched with mongooseProjectReadSchema
  const document: Record<string, any> = {
    _id: new mongoose.Types.ObjectId(),
    keyId,
    created: isoDate,
    updated: isoDate,
    isShouldUpdate: '0',
    deletedAt: null,
    data: {
      address: {
        address_en: '',
        address_th: dto.address?.trim() || '',
        district_en: '',
        district_id: 0,
        district_th: '',
        landzone: { id: '', name: '' },
        nearby: '',
        neighbors: '',
        postcode: 0,
        province_en: '',
        province_id: 0,
        province_th: dto.city?.trim() || '',
        subdistrict_en: '',
        subdistrict_id: 0,
        subdistrict_th: '',
        transport: ''
      },
      ads: {
        has_retarket_ads: false,
        retarget_content_id: '',
        retarget_facebook_content_type: '',
        retarget_google_content_type: '',
        retarget_price_start: ''
      },
      created: now,
      detail: {
        area_shared: '',
        area_total: { ngan: 0, rai: 0, wa: 0 },
        insurance_condition: '',
        num_floor: 0,
        num_lift: '',
        num_lift_service: '',
        num_parking: '',
        num_unit: 0,
        num_unit_type: '',
        ratio_parking: ''
      },
      developer: {
        address: '',
        bank_id: '',
        branch: '',
        business_segment: '',
        capital: 0,
        contact_info: '',
        department: '',
        director: '',
        display_name: '',
        email: '',
        id: '',
        image: { alt: '', thumbnail: '', title: '', url: '' },
        keyId: '',
        location: {
          bottom: '',
          lat: '',
          left: '',
          lon: '',
          right: '',
          top: ''
        },
        reg_num: '',
        title_en: '',
        title_th: '',
        website: ''
      },
      email: '',
      exreview: '',
      facebook: '',
      facility: Object.keys(facility).length > 0 ? facility : undefined,
      financial: {
        insurance_cost: '',
        not_show_start_price: false,
        num_yield: '',
        price_end: '',
        price_end_per_unit: '',
        price_facility: '',
        price_land: '',
        price_start: isNaN(priceStart) ? 0 : priceStart,
        price_start_per_unit: '',
        ratio_yield: '',
        start_price_not_found: false,
        unitof_price_facility: ''
      },
      footnote: {
        info_designer: '',
        info_financial: '',
        info_land_id: '',
        info_landlord: '',
        info_landzone: '',
        info_license_id: '',
        info_shared_prop: ''
      },
      general: {
        building_amount: '',
        detail: dto.description?.trim() || '',
        highlight: '',
        mgnt_status: '',
        promotion: '',
        promotion_start: '',
        promotion_stop: '',
        slogan: '',
        status: 'draft'
      },
      id: '',
      images: {
        main: {
          thumbnail: '',
          title: '',
          url: '',
          webp_main: '',
          webp_thumbnail: ''
        },
        map: { thumbnail: '', title: '', url: '' },
        nearby: '',
        overall: [],
        project: { thumbnail: '', title: '', url: '' }
      },
      info: {
        code: keyId.slice(-8).toUpperCase(),
        hasBlogic: false,
        posted: isoDate,
        search_keyword: dto.name.trim(),
        title_en: '',
        title_th: dto.name.trim()
      },
      line: '',
      livingscore: '',
      location: {
        bottom: '',
        heading: '',
        lat: lat,
        left: '',
        lon: lon,
        right: '',
        top: ''
      },
      meta: {
        meta_description: '',
        meta_keywords: ''
      },
      progress: {
        date_finish: '',
        date_start: '',
        progress_architect: '',
        progress_overall: '',
        progress_structure: '',
        progress_system: '',
        progress_wiring: ''
      },
      promote: {
        promote_comment: '',
        promote_compare: 0,
        promote_end_date: 0,
        promote_level: 0,
        promote_list: 0,
        promote_map: 0,
        promote_recommend: 0,
        promote_review: 0,
        promote_search: 0,
        promote_start_date: 0
      },
      property_type: propertyType ? [propertyType] : [],
      published: 0,
      selloffice: {
        address_selloffice: '',
        contact_number: ''
      },
      transaction: [],
      uid: '',
      unittype: [],
      updated: now,
      url: {
        alias_en: '',
        alias_th: ''
      },
      video: {
        aerial: { thumbnail: '', title: '', url: '' },
        customer: { thumbnail: '', title: '', url: '' },
        video: { thumbnail: '', title: '', url: '' }
      },
      website: ''
    }
  }

  // Only add geopoint if valid coordinates exist
  if (lat !== 0 || lon !== 0) {
    document.geopoint = { type: 'Point', coordinates: [lon, lat] }
  }

  return document
}
