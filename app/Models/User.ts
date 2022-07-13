import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  beforeSave,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import { v4 } from 'uuid'
import Bet from './Bet'
import Role from './Role'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

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

  @hasMany(() => Bet)
  public bets: HasMany<typeof Bet>

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
  })
  public roles: ManyToMany<typeof Role>

  @beforeCreate()
  public static assignUuid(user: User) {
    user.id = v4()
  }

  @beforeSave()
  public static async hashPasswordAndSanitizeCPF(user: User) {
    if (user.$dirty.password) user.password = await Hash.make(user.password)
    if (user.$dirty.cpf) user.cpf = this.sanitizeCPF(user.cpf)
  }

  private static sanitizeCPF(cpf: string): string {
    return cpf.replace(/\.|\s|\-/g, '')
  }
}
