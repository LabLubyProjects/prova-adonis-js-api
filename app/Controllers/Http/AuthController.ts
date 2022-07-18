import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import { sendEmail } from 'App/Services/sendEmail'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = request.all()

    const user = await User.query().where({ email: email }).preload('roles').first()

    try {
      const token = await auth.use('api').attempt(email, password, {
        name: user?.name,
        expiresIn: Env.get('NODE_ENV') === 'development' ? '' : '30mins',
      })
      return { token, user }
    } catch (error) {
      return response.unauthorized({ statusCode: 401, message: 'Invalid credentials' })
    }
  }

  public async recover({ request, response }: HttpContextContract) {
    const { email } = request.all()

    try {
      const user = await User.query().where({ email: email }).firstOrFail()
      await sendEmail(user, 'email/recover', 'Password Recovery')
      return response.ok({ message: 'Password recovery email sent successfully' })
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error sending recovery email' })
    }
  }
}
