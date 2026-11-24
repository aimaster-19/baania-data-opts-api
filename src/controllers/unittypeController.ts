import { Request, Response } from 'express'
import { UnittypeService } from '../services/unittypeService'
import { PaginationOptions } from '../interfaces/pagination'
import { asString, isLiteral } from '../utils/queryGuard'

/** Hard cap on the page number to bound Mongo's skip() and prevent large-offset scans. */
const PAGE_MAX = 10000

/** Sanitize and clamp a numeric query parameter. */
function toPositiveInt(value: unknown, defaultValue: number, max?: number): number {
  const num = Number(value)
  if (!Number.isFinite(num) || num < 1) return defaultValue
  const result = Math.floor(num)
  return max ? Math.min(result, max) : result
}

/** Build a MongoDB filter from query params. */
function buildFilter(query: Record<string, any>): Record<string, any> {
  const filter: Record<string, any> = {}

  // --- Full-text search ---
  // asString() drops any non-string (e.g. ?search[$ne]=) before it can become
  // a Mongo operator; the value is then regex-escaped against ReDoS/injection.
  const search = asString(query.search)
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [
      { keyId: { $regex: escaped, $options: 'i' } },
      { 'data.id': { $regex: escaped, $options: 'i' } },
      { 'data.info.title_th': { $regex: escaped, $options: 'i' } },
      { 'data.info.title_en': { $regex: escaped, $options: 'i' } },
      { 'data.project.title_th': { $regex: escaped, $options: 'i' } },
      { 'data.project.code': { $regex: escaped, $options: 'i' } },
      { 'data.project.project_keyId': { $regex: escaped, $options: 'i' } }
    ]
  }

  // --- List all unit types under a given project ---
  // Every exact-match value goes through asString() so an injected object
  // ({ $ne }, { $regex }, …) can never reach the query as an operator.
  const projectKeyId = asString(query.projectKeyId)
  if (projectKeyId) {
    filter['data.project.project_keyId'] = projectKeyId
  }

  // --- Exact-match filters ---
  const province = asString(query.province)
  if (province) {
    filter['data.address.province_th'] = province
  }
  const status = asString(query.status)
  if (status) {
    filter['data.general.status'] = status
  }

  // --- Publish status filter ---
  if (isLiteral(query.publishStatus, 'online')) {
    filter['data.published'] = { $nin: [0, null] }
  } else if (isLiteral(query.publishStatus, 'offline')) {
    filter['data.published'] = { $in: [0, null] }
  }

  // --- Soft-delete filter ---
  if (isLiteral(query.deleted, 'true')) {
    filter.deletedAt = { $ne: null }
  } else {
    filter.deletedAt = { $eq: null }
  }

  return filter
}

/** Allowed sort fields to prevent arbitrary field injection. */
const ALLOWED_SORT_FIELDS: Record<string, string> = {
  created: 'created',
  updated: 'updated',
  price: 'data.financial.price_start',
  title: 'data.info.title_th',
  published: 'data.published'
}

/**
 * POST /unittype/add
 * Create a new unittype. Body: { data: {...}, keyId?, geopoint?, isShouldUpdate? }
 */
export const createUnittype = async (req: Request, res: Response) => {
  try {
    const result = await UnittypeService.createUnittype(req.body)
    if (!result.success) {
      return res.status(422).json({
        status: 422,
        message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
        errors: result.validation.errors
      })
    }
    res.status(201).json({ status: 201, data: result.data, projectSync: result.projectSync })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

/**
 * GET /unittype/list
 * Query: page, limit, search, sortBy, order, projectKeyId, province, status,
 *        publishStatus, deleted
 */
export const getUnittypes = async (req: Request, res: Response) => {
  try {
    const { query } = req
    const page = toPositiveInt(query.page, 1, PAGE_MAX)
    const limit = toPositiveInt(query.limit, 20, 100)

    const sortField = ALLOWED_SORT_FIELDS[asString(query.sortBy) as string] || 'created'
    const sortOrder: 1 | -1 = isLiteral(query.order, 'asc') ? 1 : -1

    const options: PaginationOptions = {
      page,
      limit,
      filter: buildFilter(query),
      sort: { [sortField]: sortOrder }
    }

    const result = await UnittypeService.getPaginatedUnittypes(options)
    res.status(200).json({
      status: 200,
      data: result.data,
      pagination: result.pagination
    })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

/** GET /unittype/id/:id */
export const getUnittypeById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const unittype = await UnittypeService.getUnittypeById(id)
    if (!unittype) {
      return res.status(404).json({ status: 404, message: 'Unittype not found' })
    }
    res.status(200).json({ status: 200, data: unittype })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

/**
 * PUT /unittype/update/:id
 * Validate and update a unittype. Body: { data: {...}, keyId?, geopoint? }
 */
export const updateUnittype = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await UnittypeService.updateUnittype(id, req.body)

    if (!result.success) {
      return res.status(422).json({
        status: 422,
        message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
        errors: result.validation.errors
      })
    }
    if (!result.data) {
      return res.status(404).json({ status: 404, message: 'Unittype not found' })
    }
    res.status(200).json({ status: 200, data: result.data, projectSync: result.projectSync })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

/**
 * DELETE /unittype/delete/:id
 * Soft-delete a unittype (keeps the document, flags it as deleted).
 */
export const deleteUnittype = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const unittype = await UnittypeService.deleteUnittype(id)
    if (!unittype) {
      return res.status(404).json({ status: 404, message: 'Unittype not found' })
    }
    res.status(200).json({ status: 200, message: 'Unittype deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}
