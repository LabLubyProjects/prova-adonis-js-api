import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('password_recover_token', 20).after('password')
      table
        .timestamp('password_recover_token_duration', { useTz: true })
        .after('password_recover_token')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('password_recover_token', 'password_recover_token_duration')
    })
  }
}
