import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('type', 30).unique().notNullable()
      table.string('description').notNullable()
      table.integer('range').unsigned().notNullable()
      table.decimal('price').unsigned().notNullable()
      table.integer('min_and_max_number').unsigned().notNullable()
      table.string('color').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
