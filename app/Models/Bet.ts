import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 } from 'uuid'
import User from './User'
import Game from './Game'

export default class Bet extends BaseModel {
  @column({ isPrimary: true })
  public id: typeof v4

  @column()
  public userId: typeof v4

  @column()
  public gameId: typeof v4

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Game)
  public game: BelongsTo<typeof Game>
}
