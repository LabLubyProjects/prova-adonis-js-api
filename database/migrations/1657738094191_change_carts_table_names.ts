import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'carts'

  public async up() {
    this.schema.renameTable('carts', 'cart')
  }

  public async down() {
    this.schema.renameTable('cart', 'carts')
  }
}
