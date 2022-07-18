import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import { sendEmail } from 'App/Services/sendEmail'
import ForgotPasswordValidator from 'App/Validators/User/ForgotPasswordValidator'
import * as crypto from 'crypto'
import { DateTime } from 'luxon'
import ResetPasswordValidator from 'App/Validators/User/ResetPasswordValidator'
import Database from '@ioc:Adonis/Lucid/Database'

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

  public async forgot_password({ request, response }: HttpContextContract) {
    await request.validate(ForgotPasswordValidator)

    const { email } = request.all()

    try {
      const user = await User.findBy('email', email)

      if (!user) return response.notFound({ statusCode: 404, message: 'User not found' })

      const token = crypto.randomBytes(20).toString('hex')
      const tokenExpiration = DateTime.now().plus({ hour: 1 })

      user.passwordRecoverToken = token
      user.passwordRecoverTokenDuration = tokenExpiration
      await user.save()
      await sendEmail(user, 'email/recover', 'Password Recovery Token')
      return response.ok({ message: 'Password recovery token email sent successfully!' })
    } catch (error) {
      console.log(error)
      return response.badRequest({ statusCode: 400, message: 'Error sending token recovery email' })
    }
  }

  public async reset_password({ request, response }: HttpContextContract) {
    await request.validate(ResetPasswordValidator)

    const { email, token, newPassword } = request.all()

    try {
      const user = await User.findBy('email', email)

      if (!user) return response.notFound({ statusCode: 404, message: 'User not found' })

      if (token !== user.passwordRecoverToken)
        return response.badRequest({ statusCode: 400, message: 'Invalid token' })

      if (DateTime.now() > token.passwordRecoverTokenDuration)
        return response.badRequest({ statusCode: 400, message: 'Token expired' })

      user.password = newPassword
      await user.save()
      return response.ok({ message: 'Password reset successfully!' })
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error on reset password' })
    }
  }
}
