import { Request, Response } from 'express';
import { ProjectReadService } from '../services/projectReadService';
import { PaginationOptions } from '../interfaces/pagination';

/**
 * Sanitize and clamp a numeric query parameter.
 */
function toPositiveInt(value: unknown, defaultValue: number, max?: number): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return defaultValue;
  const result = Math.floor(num);
  return max ? Math.min(result, max) : result;
}

/**
 * Build a MongoDB filter object from incoming query parameters.
 * Supports text search across multiple fields and exact-match filters.
 */
function buildFilter(query: Record<string, any>): Record<string, any> {
  const filter: Record<string, any> = {};

  // --- Full-text search across title & code ---
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const keyword = query.search.trim();
    // Escape special regex characters to prevent injection
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { 'data.info.title_th': { $regex: escaped, $options: 'i' } },
      { 'data.info.title_en': { $regex: escaped, $options: 'i' } },
      { 'data.info.code': { $regex: escaped, $options: 'i' } },
      { 'data.developer.display_name': { $regex: escaped, $options: 'i' } },
    ];
  }

  // --- Exact-match filters ---
  if (query.propertyType) {
    filter['data.property_type.title_th'] = query.propertyType;
  }

  if (query.province) {
    filter['data.address.province_th'] = query.province;
  }

  if (query.status) {
    filter['data.general.status'] = query.status;
  }

  // Exclude soft-deleted documents
  filter.deletedAt = { $eq: null };

  return filter;
}

/**
 * Allowed sort fields to prevent arbitrary field injection.
 */
const ALLOWED_SORT_FIELDS: Record<string, string> = {
  created: 'created',
  updated: 'updated',
  title: 'data.info.title_th',
  code: 'data.info.code',
  price: 'data.financial.price_start',
  province: 'data.address.province_th',
  status: 'data.general.status',
  published: 'data.published',
};

// ─── CRUD Handlers ───────────────────────────────────────────────

/**
 * POST /projectread/add
 *
 * Accepts a flat, frontend-friendly body and transforms it
 * into the nested MongoDB schema. Returns validation errors
 * (422) or the created document (201).
 *
 * Body (JSON):
 *   name          - (required) Project name in Thai
 *   type          - (required) 'house' | 'condo' | 'townhouse' | 'land'
 *   address       - Full address text
 *   city          - Province/City name (Thai)
 *   coordinates   - Comma-separated lat,lon string (e.g. "13.75, 100.50")
 *   description   - Project description
 *   features      - Array of facility names, e.g. ['สระว่ายน้ำ', 'ฟิตเนส']
 *   price         - Starting price (number or string)
 *   currency      - Currency code (e.g. 'THB')
 */
export const createProjectRead = async (req: Request, res: Response) => {
  try {
    const result = await ProjectReadService.createProjectRead(req.body);

    if (!result.success) {
      return res.status(422).json({
        status: 422,
        message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
        errors: result.validation.errors,
      });
    }

    res.status(201).json({ status: 201, data: result.data });
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

/**
 * GET /projectread/list
 *
 * Query params:
 *   page         - page number (default 1)
 *   limit        - items per page (default 20, max 100)
 *   search       - keyword search across title_th, title_en, code, developer
 *   sortBy       - field to sort by (created | updated | title | code | price | province | status | published)
 *   order        - asc | desc (default desc)
 *   propertyType - exact match on property_type.title_th
 *   province     - exact match on address.province_th
 *   status       - exact match on general.status
 */
export const getProjectReads = async (req: Request, res: Response) => {
  try {
    const { query } = req;

    // Parse pagination
    const page = toPositiveInt(query.page, 1);
    const limit = toPositiveInt(query.limit, 20, 100); // cap at 100

    // Build sort
    const sortField = ALLOWED_SORT_FIELDS[query.sortBy as string] || 'created';
    const sortOrder: 1 | -1 = query.order === 'asc' ? 1 : -1;

    // Build filter
    const filter = buildFilter(query);

    const options: PaginationOptions = {
      page,
      limit,
      filter,
      sort: { [sortField]: sortOrder },
    };

    const result = await ProjectReadService.getPaginatedProjectReads(options);

    res.status(200).json({
      status: 200,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

export const getProjectReadById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = await ProjectReadService.getProjectReadById(id);
    if (!project) {
      return res.status(404).json({ status: 404, message: 'ProjectRead not found' });
    }
    res.status(200).json({ status: 200, data: project });
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

export const updateProjectRead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = await ProjectReadService.updateProjectRead(id, req.body);
    if (!project) {
      return res.status(404).json({ status: 404, message: 'ProjectRead not found' });
    }
    res.status(200).json({ status: 200, data: project });
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

export const deleteProjectRead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = await ProjectReadService.deleteProjectRead(id);
    if (!project) {
      return res.status(404).json({ status: 404, message: 'ProjectRead not found' });
    }
    res.status(200).json({ status: 200, message: 'ProjectRead deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
