import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'carts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.decimal('min_cart_value').unsigned().notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
