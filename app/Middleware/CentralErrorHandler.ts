import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CentralErrorHandler {
  public async handle({ response }: HttpContextContract, next: () => Promise<void>) {
    try {
      await next()
    } catch (error) {
      response.internalServerError({ statusCode: 500, message: error.message })
    }
  }
}
