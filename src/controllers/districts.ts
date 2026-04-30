import { Request, Response } from 'express'
import DistrictsService from '../services/districts'

export default class DistrictsController {
  public static async getDistricts(req: Request, res: Response) {
    const districts = await DistrictsService.getDistricts({
      title_th: req.query.title_th as string,
      provinceCode: req.query.provinceCode as string
    })
    res.json({
      status: 200,
      data: districts
    })
  }
}
