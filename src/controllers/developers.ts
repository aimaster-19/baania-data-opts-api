import { Request, Response } from 'express'
import DevelopersService from '../services/developer'

export async function getDevelopersController(req: Request, res: Response): Promise<void> {
  try {
    const { limit, title_th } = req.query
    console.log('title_th', req.query)
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
