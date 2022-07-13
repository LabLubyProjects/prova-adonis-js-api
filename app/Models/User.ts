import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 } from 'uuid'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: typeof v4

  @column()
  public name: string

  @column()
  public cpf: string

  @column()
  public email: string

  @column()
  public password: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
