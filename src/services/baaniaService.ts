import axios from 'axios'

export default class BaaniaService {
  public static async loginSso({
    email,
    password
  }: {
    email: string
    password: string
  }): Promise<any> {
    try {
      const baaniaLoginUrl =
        process.env.SSO_URL + '/api/v1/login' ||
        'https://api.baania.com/api/v1/login'
      const response = await axios.post(baaniaLoginUrl, {
        email,
        password
      })

      return response.data
    } catch (e: any) {
      // Provide a clearer error if Baania rejects the login
      if (e.response && e.response.data) {
        throw new Error(e.response.data.message || 'Baania SSO login failed')
      }
      throw e
    }
  }
}
