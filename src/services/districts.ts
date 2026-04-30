import { FilterQuery } from 'mongoose'
import District from '../models/District'
export default class DistrictsService {
  public static async getDistricts({
    title_th,
    provinceCode
  }: {
    title_th?: string
    provinceCode: string
  }): Promise<any> {
    try {
      const filterOption: FilterQuery<any> = {
        'data.province.code': provinceCode
      }
      if (title_th) {
        filterOption['data.title.title_th'] = {
          $regex: `^${title_th}`,
          $options: 'i'
        }
      }
      const districts = await District.find(filterOption)
        .sort({ 'data.title.title_th': 'asc' })
        .select(['data.id', 'data.title.title_th'])
      return districts
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
