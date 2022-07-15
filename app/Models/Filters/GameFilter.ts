import { BaseModelFilter } from '@ioc:Adonis/Addons/LucidFilter'
import { ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import Game from 'App/Models/Game'

export default class GameFilter extends BaseModelFilter {
  public $query: ModelQueryBuilderContract<typeof Game, Game>

  public type(value: string) {
    this.$query.where('type', 'LIKE', `%${value}%`)
  }

  public description(value: string) {
    this.$query.where('description', 'LIKE', `%${value}%`)
  }

  public price(value: number) {
    this.$query.where('price', '<=', value)
  }
}
