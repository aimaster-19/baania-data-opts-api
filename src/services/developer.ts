import Developers from '../models/Developers'
import { FilterQuery } from 'mongoose'

export default class DevelopersService {
  public static async getDevelopers({
    title_th,
    limit
  }: {
    title_th?: string
    limit?: number
  }): Promise<any> {
    try {
      const filterOption: FilterQuery<any> = {}
      if (title_th) {
        filterOption['data.title'] = {
          $regex: `^${title_th}`,
          $options: 'i'
        }
      }
      const developers = await Developers.find(filterOption)
        .sort({ 'data.title': 'asc' })
        .limit(limit || 10)
      return developers
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
