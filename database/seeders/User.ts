import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { v4 } from 'uuid'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public static developmentOnly = true
  public async run() {
    const roleAdmin = await Role.findBy('name', 'admin')
    const rolePlayer = await Role.findBy('name', 'player')
    let admin = await User.findBy('email', 'admin@admin.com')

    if (!admin) {
      admin = await User.create({
        id: v4(),
        name: 'Admin',
        cpf: '000.000.000-00',
        email: 'admin@admin.com',
        password: 'admin123',
      })
      if (roleAdmin) await admin.related('roles').attach([roleAdmin.id])
      if (rolePlayer) await admin.related('roles').attach([rolePlayer.id])
    }

    let player = await User.findBy('email', 'player@player.com')

    if (!player) {
      player = await User.create({
        id: v4(),
        name: 'Player',
        cpf: '000.000.000-01',
        email: 'player@player.com',
        password: 'player123',
      })

      if (rolePlayer) await player.related('roles').attach([rolePlayer.id])
    }
  }
}
