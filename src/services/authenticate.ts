import { Admin } from '../entities/postgres/Admin'

export default class AuthenticateService {
  public static async loginEmail(email: string): Promise<any> {
    const admin = await Admin.createQueryBuilder('admin')
      .where('admin.email = :email', { email })
      .getOne()

    if (!admin?.id) {
      throw { status: 400, message: 'user not found' }
    }
    if (admin.status !== 'active') {
      throw { status: 400, message: 'user is not active' }
    }

    // Use update method instead of save to avoid concurrent query issues
    await Admin.update({ id: admin.id }, { lastLoginDate: new Date() })

    // Fetch the updated record
    const updatedAdmin = await Admin.findOne({
      where: { id: admin.id }
    })

    return updatedAdmin
  }
}
