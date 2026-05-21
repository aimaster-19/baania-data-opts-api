import PropertyType from '../models/PropertyType'
import { FilterQuery } from 'mongoose'

export default class PropertyTypeService {
  public static async getPropertyTypes(title_th: string) {
    const filterOption: FilterQuery<any> = {}
    if (title_th) {
      filterOption['data.name_th'] = {
        $regex: `^${title_th}`,
        $options: 'i'
      }
    }
    return await PropertyType.find(filterOption)
      .sort({ 'data.id': 'asc' })
      .collation({ locale: 'en', numericOrdering: true })
      .select(['data.id', 'data.name_th', 'data.name_en'])
  }
}
