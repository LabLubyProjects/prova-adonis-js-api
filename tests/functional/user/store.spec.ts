import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Users.store', (usersStore) => {
  usersStore.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return async () => await Database.rollbackGlobalTransaction()
  })

  test('Should return 422 code due to name length being shorter than 3 characters', async ({
    client,
    route,
  }) => {
    const response = await client.post(route('UsersController.store')).json({
      name: 'Jo',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'minLength',
          field: 'name',
          message: 'name field must be at least 3',
          args: { minLength: 3 },
        },
      ],
    })

    test('Should return 422 code due to name length being greater than 50 characters', async ({
      client,
      route,
    }) => {
      const response = await client.post(route('UsersController.store')).json({
        name: 'Johnohnohnohnohnohnohnohnohnohnohnohnohnohnohnohnoh',
      })

      response.assertStatus(422)
      response.assertBodyContains({
        errors: [
          {
            rule: 'maxLength',
            field: 'name',
            message: 'name field must be up to 50',
            args: { maxLength: 50 },
          },
        ],
      })
    })

    test('Should return 422 code due to name containing invalid characters', async ({
      client,
      route,
    }) => {
      const response = await client.post(route('UsersController.store')).json({
        name: '_a-sajsid.',
      })

      response.assertStatus(422)
      response.assertBodyContains({
        errors: [
          {
            rule: 'regex',
            field: 'name',
            message: 'name field with invalid format',
          },
        ],
      })
    })

    test('Should return 422 code due to cpf invalid cpf', async ({ client, route }) => {
      const response = await client.post(route('UsersController.store')).json({
        name: 'John Derek',
        cpf: '12031203',
      })

      response.assertStatus(422)
      response.assertBodyContains({
        errors: [
          {
            rule: 'regex',
            field: 'cpf',
            message: 'cpf field with invalid format',
          },
        ],
      })
    })

    test('Should return 422 code due to repeated cpf', async ({ client, route }) => {
      const response = await client.post(route('UsersController.store')).json({
        name: 'John Derek',
        cpf: '000.000.000-00',
      })

      response.assertStatus(422)
      response.assertBodyContains({
        errors: [
          {
            rule: 'unique',
            field: 'cpf',
            message: 'cpf already exists',
          },
        ],
      })
    })

    test('Should return 422 code due to email length being greater than 50 characters', async ({
      client,
      route,
    }) => {
      const response = await client.post(route('UsersController.store')).json({
        name: 'John Derek',
        cpf: '000.000.000-02',
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

    test('Should return 422 code due to invalid email', async ({ client, route }) => {
      const response = await client.post(route('UsersController.store')).json({
        name: 'John Derek',
        cpf: '000.000.000-02',
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

    test('Should return 422 code due to repeated email', async ({ client, route }) => {
      const response = await client.post(route('UsersController.store')).json({
        name: 'John Derek',
        cpf: '000.000.000-02',
        email: 'admin@admin.com',
      })

      response.assertStatus(422)
      response.assertBodyContains({
        errors: [
          {
            rule: 'unique',
            field: 'email',
            message: 'email already exists',
          },
        ],
      })
    })
    test('Should return 422 code due to password length being greater than 50 characters', async ({
      client,
      route,
    }) => {
      const response = await client.post(route('UsersController.store')).json({
        name: 'John Derek',
        cpf: '000.000.000-02',
        email: 'johnderek@email.com',
        password: '123123123123123123123123123123123123123123123123123',
      })

      response.assertStatus(422)
      response.assertBodyContains({
        errors: [
          {
            rule: 'maxLength',
            field: 'password',
            message: 'password field must be up to 50',
            args: { maxLength: 50 },
          },
        ],
      })
    })

    test('Should create user and send an welcome email', async ({ client, route, assert }) => {
      const mailer = Mail.fake()
      const response = await client.post(route('UsersController.store')).json({
        name: 'John Derek',
        cpf: '000.000.000-10',
        email: 'johnderek1@email.com',
        password: 'johnderek123',
      })
      response.assertStatus(201)
      assert.isTrue(mailer.exists((email) => email.subject === 'Welcome to Bets System!'))
      Mail.restore()
    })
  })
})
