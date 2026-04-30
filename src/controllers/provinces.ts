import ProvincesService from '../services/provinces'
import { Request, Response } from 'express'

export default class ProvincesController {
  public static async getProvinces(req: Request, res: Response) {
    const title_th = req.query.title_th as string
    const provinces = await ProvincesService.getProvinces(title_th)
    res.json({
      status: 200,
      data: provinces
    })
  }
}
