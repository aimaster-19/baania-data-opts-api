import { Request, Response } from 'express'
import DevelopersService from '../services/developer'

export async function getDevelopersController(req: Request, res: Response): Promise<void> {
  try {
    const { limit, title_th } = req.query
    const developers = await DevelopersService.getDevelopers({
      title_th: title_th as string,
      limit: limit ? Number(limit) : undefined
    })
    res.status(200).json({
      status: 200,
      data: developers
    })
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

/**
 * POST /developers
 * Create a new developer.
 * Body (JSON): { data: {...}, keyId?: string }
 */
export async function createDeveloperController(req: Request, res: Response) {
  try {
    const validation = DevelopersService.validate(req.body, false)
    if (!validation.valid) {
      return res.status(422).json({
        status: 422,
        message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
        errors: validation.errors
      })
    }

    const developer = await DevelopersService.createDeveloper(req.body)
    res.status(201).json({ status: 201, data: developer })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

/**
 * PUT /developers/:id
 * Update an existing developer by _id.
 * Body (JSON): { data: {...}, keyId?: string }
 */
export async function updateDeveloperController(req: Request, res: Response) {
  try {
    const id = req.params.id as string

    const validation = DevelopersService.validate(req.body, true)
    if (!validation.valid) {
      return res.status(422).json({
        status: 422,
        message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
        errors: validation.errors
      })
    }

    const developer = await DevelopersService.updateDeveloper(id, req.body)
    if (!developer) {
      return res.status(404).json({ status: 404, message: 'Developer not found' })
    }
    res.status(200).json({ status: 200, data: developer })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}
