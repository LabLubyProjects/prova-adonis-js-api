import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 } from 'uuid'

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
}
