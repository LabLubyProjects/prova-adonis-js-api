import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { Filterable } from '@ioc:Adonis/Addons/LucidFilter'
import { v4 } from 'uuid'
import Bet from './Bet'
import GameFilter from './Filters/GameFilter'

export default class Game extends compose(BaseModel, Filterable) {
  public static $filter = () => GameFilter

  @column({ isPrimary: true })
  public id: string

  @column()
  public type: string

  @column()
  public description: string

  @column()
  public range: number

  @column()
  public price: number

  @column()
  public minAndMaxNumber: number

  @column()
  public color: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Bet)
  public bets: HasMany<typeof Bet>

  @beforeCreate()
  public static assignUuid(game: Game) {
    game.id = v4()
  }
}
