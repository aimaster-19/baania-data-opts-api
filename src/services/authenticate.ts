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

  // Adding loginFirebase for completeness from reference
  public static async loginFirebase(decodedToken: any): Promise<any> {
    const { email, name, picture, uid, firebase } = decodedToken

    const admin = await Admin.findOne({
      where: { email },
      withDeleted: false,
      order: { id: 'DESC' }
    })
    if (!admin?.id) {
      throw { errMessage: 'admin does not exists' }
    }

    let adminData = {} as Admin
    if (admin.status !== 'active' && admin.lastLoginDate === null) {
      adminData = {
        name: name,
        pictureUrl: picture,
        firebaseUid: uid,
        firebaseType: firebase.sign_in_provider,
        status: 'active',
        lastLoginDate: new Date()
      } as Admin
    } else {
      adminData = {
        lastLoginDate: new Date()
      } as Admin
    }

    // Update the admin record
    await Admin.update({ id: admin.id }, adminData)

    // Fetch and return the updated record in a single query
    const updatedAdmin = await Admin.findOne({
      where: { id: admin.id }
    })

    return updatedAdmin
  }
}
