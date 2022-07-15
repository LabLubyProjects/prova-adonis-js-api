import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MessagesCustom from '../MessagesCustom'

export default class UpdateValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public refs = schema.refs({
    id: this.ctx.params.id,
  })

  public schema = schema.create({
    type: schema.string.optional({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(3),
      rules.regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1-]*$/g),
      rules.unique({
        table: 'games',
        column: 'type',
        whereNot: {
          id: this.refs.id,
        },
        caseInsensitive: true,
      }),
    ]),
    description: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
      rules.minLength(10),
    ]),
    range: schema.number.optional([rules.unsigned()]),
    price: schema.number.optional([rules.unsigned()]),
    minAndMaxNumber: schema.number.optional([rules.unsigned()]),
    color: schema.string.optional({ trim: true }),
  })
}
