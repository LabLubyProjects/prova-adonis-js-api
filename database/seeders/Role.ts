import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'
import { v4 } from 'uuid'

export default class extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name'

    await Role.updateOrCreateMany(uniqueKey, [
      {
        id: v4(),
        name: 'admin',
        description: 'Access to all system features',
      },
      {
        id: v4(),
        name: 'player',
        description: 'Access to bet features',
      },
    ])
  }
}
