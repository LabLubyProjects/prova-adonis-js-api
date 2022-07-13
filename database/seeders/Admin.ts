import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { v4 } from 'uuid'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public static developmentOnly = true
  public async run() {
    const emailAdminQueryField = { email: 'admin@admin.com' }

    const userAdmin = await User.updateOrCreate(emailAdminQueryField, {
      id: v4(),
      name: 'Admin',
      cpf: '054.621.881-45',
      email: 'admin@admin.com',
      password: 'admin123',
    })
    const roleAdmin = await Role.findBy('name', 'admin')
    if (roleAdmin) await userAdmin.related('roles').attach([roleAdmin.id])
  }
}
