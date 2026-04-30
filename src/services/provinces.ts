import Provinces from '../models/Provinces'

export default class ProvincesService {
  public static async getProvinces() {
    return await Provinces.find()
      .sort({ 'data.title.title_th': 'asc' })
      .select(['data.id', 'data.title.title_th'])
  }
}
