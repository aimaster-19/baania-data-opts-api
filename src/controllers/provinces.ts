import ProvincesService from '../services/provinces'
import { Request, Response } from 'express'

export default class ProvincesController {
  public static async getProvinces(req: Request, res: Response) {
    const provinces = await ProvincesService.getProvinces()
    res.json({
      status: 200,
      data: provinces
    })
  }
}
