import { schema, rules } from '@ioc:Adonis/Core/Validator'
import MessagesCustom from '../MessagesCustom'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    minCartValue: schema.number([rules.unsigned()]),
  })
}
