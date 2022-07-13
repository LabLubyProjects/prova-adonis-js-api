import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'bets'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .uuid('game_id')
        .references('id')
        .inTable('games')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.string('numbers').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
