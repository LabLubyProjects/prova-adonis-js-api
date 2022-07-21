import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'
import * as crypto from 'crypto'
import { DateTime } from 'luxon'

test.group('Authentication', (auth) => {
  auth.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return async () => await Database.rollbackGlobalTransaction()
  })

  test('Should return 401 on login because user credentials are invalid', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('AuthController.login')).json({
      email: 'invalidEmail@email.com',
      password: 'invalidPassword',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  })

  test('Should return 200 and login', async ({ client, route }) => {
    const response = await client.post(route('AuthController.login')).json({
      email: 'admin@admin.com',
      password: 'admin123',
    })

    response.assertStatus(200)
  })

  test('Should return 422 code on forgot password due to email length being greater than 50 characters', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('AuthController.forgot_password')).json({
      email: 'Johnohnohnohnohnohnohnohnohnohnohnonohnoh@email.com',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'maxLength',
          field: 'email',
          message: 'email field must be up to 50',
          args: { maxLength: 50 },
        },
      ],
    })
  })

  test('Should return 422 code on forgot password due to invalid email', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('AuthController.forgot_password')).json({
      email: 'johnderek.com',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'email',
          field: 'email',
          message: 'email field should be a valid email',
        },
      ],
    })
  })

  test('Should return 422 code on forgot password due to inexistent email', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('AuthController.forgot_password')).json({
      email: 'john@derek.com',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'exists',
          field: 'email',
          message: 'email not found in us database',
        },
      ],
    })
  })

  test('Should return 200 code on forgot password and send reset email to user', async ({
    client,
    route,
    assert,
  }) => {
    const mailer = Mail.fake()

    const response = await client.post(route('AuthController.forgot_password')).json({
      email: 'admin@admin.com',
    })

    response.assertStatus(200)
    assert.isTrue(mailer.exists((email) => email.subject === 'Password Recovery Token'))
    Mail.restore()
  })

  test('Should return 422 code on reset password due to email length being greater than 50 characters', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('AuthController.reset_password')).json({
      email: 'Johnohnohnohnohnohnohnohnohnohnohnonohnoh@email.com',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'maxLength',
          field: 'email',
          message: 'email field must be up to 50',
          args: { maxLength: 50 },
        },
      ],
    })
  })

  test('Should return 422 code on reset password due to invalid email', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('AuthController.reset_password')).json({
      email: 'johnderek.com',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'email',
          field: 'email',
          message: 'email field should be a valid email',
        },
      ],
    })
  })

  test('Should return 422 code on reset password due to inexistent email', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('AuthController.reset_password')).json({
      email: 'john@derek.com',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'exists',
          field: 'email',
          message: 'email not found in us database',
        },
      ],
    })
  })

  test('Should return 422 code on reset password due to new password length being greater than 50 characters', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('AuthController.reset_password')).json({
      email: 'admin@admin.com',
      newPassword: '123123123123123123123123123123123123123123123123123',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'maxLength',
          field: 'newPassword',
          message: 'newPassword field must be up to 50',
          args: { maxLength: 50 },
        },
      ],
    })
  })

  test('Should return 200 code on reset password and update users password', async ({
    client,
    route,
  }) => {
    const token = crypto.randomBytes(20).toString('hex')
    const tokenExpiration = DateTime.now().plus({ hour: 1 })

    const user = await User.findBy('email', 'admin@admin.com')
    user!.passwordRecoverToken = token
    user!.passwordRecoverTokenDuration = tokenExpiration
    await user!.save()

    const response = await client.post(route('AuthController.reset_password')).json({
      email: 'admin@admin.com',
      token,
      newPassword: 'newadminpassword',
    })

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Password reset successfully!' })
  })
})
