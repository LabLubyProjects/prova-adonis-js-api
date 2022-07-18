import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MessagesCustom from '../MessagesCustom'

export default class AllowAccessValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    userId: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'id' })]),
    roles: schema
      .array([rules.minLength(1)])
      .members(schema.string({ trim: true }, [rules.exists({ table: 'roles', column: 'name' })])),
  })
}
