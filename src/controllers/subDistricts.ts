import { Request, Response } from 'express'
import SubDistrictsService from '../services/subDistrics'

export default class SubDistrictsController {
  public static async getSubDistricts(req: Request, res: Response) {
    try {
      const { title_th, districtCode } = req.query
      const subdistricts = await SubDistrictsService.getSubDistricts({
        title_th: title_th as string,
        districtCode: districtCode as string
      })
      res.json({ status: 200, data: subdistricts })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
