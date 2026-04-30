import ProjectRead from '../models/ProjectRead'
import { PaginationOptions, PaginationMeta } from '../interfaces/pagination'
import {
  CreateProjectDTO,
  validateCreateProject,
  transformToDocument,
  ValidationResult
} from '../interfaces/createProjectDTO'

/**
 * Fields selected for the list view to minimize payload size.
 * The full project document is very large; we only fetch what the
 * list/table UI actually needs.
 */
const LIST_SELECT_FIELDS: Record<string, 1> = {
  _id: 1,
  keyId: 1,
  created: 1,
  updated: 1,
  'data.info.code': 1,
  'data.info.title_th': 1,
  'data.info.title_en': 1,
  'data.info.posted': 1,
  'data.general.status': 1,
  'data.property_type': 1,
  'data.address.province_th': 1,
  'data.address.district_th': 1,
  'data.address.subdistrict_th': 1,
  'data.financial.price_start': 1,
  'data.financial.price_end': 1,
  'data.detail.num_unit': 1,
  'data.developer.display_name': 1,
  'data.images.main.thumbnail': 1,
  'data.published': 1
}

export class ProjectReadService {
  /**
   * Validate and create a new project from a flat DTO.
   * Returns either the saved document or validation errors.
   */
  public static async createProjectRead(
    dto: CreateProjectDTO
  ): Promise<
    | { success: true; data: any }
    | { success: false; validation: ValidationResult }
  > {
    // 1. Validate
    const validation = validateCreateProject(dto)
    if (!validation.valid) {
      return { success: false, validation }
    }

    // 2. Transform flat DTO → nested document
    const document = transformToDocument(dto)

    // 3. Save
    const newProject = new ProjectRead(document)
    const saved = await newProject.save()

    return { success: true, data: saved }
  }

  /**
   * Paginated list with search, filter, and sort.
   * Runs count + find in parallel for optimal performance.
   */
  public static async getPaginatedProjectReads(options: PaginationOptions) {
    const { page, limit, filter, sort, select } = options
    const skip = (page - 1) * limit

    const selectedFields = select || LIST_SELECT_FIELDS

    // Run count and find in parallel to cut response time
    const [total, data] = await Promise.all([
      ProjectRead.countDocuments(filter),
      ProjectRead.find(filter)
        .select(selectedFields)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean() // lean() returns plain JS objects — faster & less memory
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
   * Fetch all projects (no pagination). Kept for backward-compatibility
   * but prefer getPaginatedProjectReads for list views.
   */
  public static async getAllProjectReads(filter: any = {}) {
    return await ProjectRead.find(filter)
  }

  /**
   * Fetch a single project by its MongoDB _id.
   */
  public static async getProjectReadById(id: string) {
    return await ProjectRead.findById(id)
  }

  /**
   * Update a project by _id and return the updated document.
   */
  public static async updateProjectRead(id: string, data: any) {
    return await ProjectRead.findByIdAndUpdate(id, data, { new: true })
  }

  /**
   * Soft- or hard-delete a project by _id.
   */
  public static async deleteProjectRead(id: string) {
    return await ProjectRead.findByIdAndDelete(id)
  }
}
