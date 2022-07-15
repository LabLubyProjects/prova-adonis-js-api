import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CentralErrorHandler {
  public async handle({ response }: HttpContextContract, next: () => Promise<void>) {
    try {
      await next()
    } catch (error) {
      console.log(error.messages)
      if (error instanceof AuthenticationException)
        return response.unauthorized({ statusCode: 401, message: 'Invalid credentials' })
      return response.internalServerError({ statusCode: 500, message: error.message })
    }
  }
}
