import { FilterQuery } from 'mongoose'
import SubDistricts from '../models/Subdistricts'

export default class SubDistrictsService {
  public static async getSubDistricts({
    title_th,
    districtCode
  }: {
    title_th?: string
    districtCode: string
  }): Promise<any> {
    try {
      const filterOption: FilterQuery<any> = {
        'data.district.code': districtCode
      }
      if (title_th) {
        filterOption['data.title.title_th'] = {
          $regex: `^${title_th}`,
          $options: 'i'
        }
      }
      const subdistricts = await SubDistricts.find(filterOption)
        .sort({ 'data.title.title_th': 'asc' })
        .select(['data.id', 'data.title.title_th', 'data.title.title_en'])
      return subdistricts
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
