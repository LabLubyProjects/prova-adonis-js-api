import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MessagesCustom from '../MessagesCustom'

export default class StoreValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    type: schema.string({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(3),
      rules.regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1-]*$/g),
      rules.unique({ table: 'games', column: 'type' }),
    ]),
    description: schema.string({ trim: true }, [rules.maxLength(255), rules.minLength(10)]),
    range: schema.number([rules.unsigned()]),
    price: schema.number([rules.unsigned()]),
    minAndMaxNumber: schema.number([rules.unsigned()]),
    color: schema.string({ trim: true }),
  })
}
