import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { v4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'user_roles'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('id').defaultTo(v4()).alter()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('id').alter()
    })
  }
}
