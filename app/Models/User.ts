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
import { compose } from '@ioc:Adonis/Core/Helpers'
import { Filterable } from '@ioc:Adonis/Addons/LucidFilter'
import UserFilter from './Filters/UserFilter'
import { v4 } from 'uuid'
import Bet from './Bet'
import Role from './Role'

export default class User extends compose(BaseModel, Filterable) {
  public static $filter = () => UserFilter

  @column({ isPrimary: true })
  public id: string

  @column({ serializeAs: null })
  public rememberMeToken?: string

  @column()
  public name: string

  @column()
  public cpf: string

  @column()
  public email: string

  @column({ serializeAs: null })
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
  public static async hashPassword(user: User) {
    if (user.$dirty.password) user.password = await Hash.make(user.password)
  }
}
