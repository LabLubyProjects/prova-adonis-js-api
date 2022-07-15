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
      cpf: '000.000.000-00',
      email: 'admin@admin.com',
      password: 'admin123',
    })
    const roleAdmin = await Role.findBy('name', 'admin')
    const rolePlayer = await Role.findBy('name', 'player')
    if (roleAdmin) await userAdmin.related('roles').attach([roleAdmin.id])
    if (rolePlayer) await userAdmin.related('roles').attach([rolePlayer.id])

    const emailPlayerQueryField = { email: 'player@player.com' }
    const userPlayer = await User.updateOrCreate(emailPlayerQueryField, {
      id: v4(),
      name: 'Player',
      cpf: '000.000.000-01',
      email: 'player@player.com',
      password: 'player123',
    })
    console.log(rolePlayer?.id, roleAdmin?.id)
    if (rolePlayer) await userPlayer.related('roles').attach([rolePlayer.id])
  }
}
