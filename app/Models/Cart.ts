import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Cart extends BaseModel {
  public static table = 'cart'

  @column()
  public minCartValue: number
}
