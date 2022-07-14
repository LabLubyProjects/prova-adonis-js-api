import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_roles'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.increments('id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('id')
    })
  }
}
