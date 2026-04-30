import { FilterQuery } from 'mongoose'
import Provinces from '../models/Provinces'

export default class ProvincesService {
  public static async getProvinces(title_th: string) {
    const filterOption: FilterQuery<any> = {}
    if (title_th) {
      filterOption['data.title.title_th'] = {
        $regex: `^${title_th}`,
        $options: 'i'
      }
    }
    return await Provinces.find(filterOption)
      .sort({ 'data.title.title_th': 'asc' })
      .select(['data.id', 'data.title.title_th'])
  }
}
