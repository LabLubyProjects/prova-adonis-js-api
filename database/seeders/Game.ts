import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Game from 'App/Models/Game'
import { v4 } from 'uuid'

export default class extends BaseSeeder {
  public async run() {
    const uniqueKey = 'type'

    await Game.updateOrCreateMany(uniqueKey, [
      {
        id: v4(),
        type: 'Lotofácil',
        description:
          'Escolha 15 números para apostar na lotofácil. Você ganha acertando 11, 12, 13, 14 ou 15 números. São muitas chances de ganhar, e agora você joga de onde estiver!',
        range: 25,
        price: 2.5,
        minAndMaxNumber: 15,
        color: '#7F3992',
      },
      {
        id: v4(),
        type: 'Mega-Sena',
        description:
          'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
        range: 60,
        price: 4.5,
        minAndMaxNumber: 6,
        color: '#01AC66',
      },
      {
        id: v4(),
        type: 'Quina',
        description:
          'Escolha 5 números dos 80 disponíveis na quina. 5, 4, 3 ou 2 acertos. São seis sorteios semanais e seis chances de ganhar.',
        range: 80,
        price: 2,
        minAndMaxNumber: 5,
        color: '#F79C31',
      },
    ])
  }
}
