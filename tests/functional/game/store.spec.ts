import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Games.store', async (gamesStore) => {
  let admin
  let player
  gamesStore.setup(async () => {
    admin = await User.findBy('email', 'admin@admin.com')
    player = await User.findBy('email', 'player@player.com')
  })

  gamesStore.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return async () => await Database.rollbackGlobalTransaction()
  })

  test('Should return 422 code due to type length being shorter than 3 characters', async ({
    client,
    route,
  }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Jo',
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'minLength',
          field: 'type',
          message: 'type field must be at least 3',
          args: { minLength: 3 },
        },
      ],
    })
  })

  test('Should return 422 code due to name length being greater than 50 characters', async ({
    client,
    route,
  }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Johnohnohnohnohnohnohnohnohnohnohnohnohnohnohnohnoh',
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'maxLength',
          field: 'type',
          message: 'type field must be up to 50',
          args: { maxLength: 50 },
        },
      ],
    })
  })

  test('Should return 422 code due to type containing invalid characters', async ({
    client,
    route,
  }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: '_a-sajsid.',
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'regex',
          field: 'type',
          message: 'type field with invalid format',
        },
      ],
    })
  })

  test('Should return 422 code due to repeated type', async ({ client, route }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Quina',
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'unique',
          field: 'type',
          message: 'type already exists',
        },
      ],
    })
  })

  test('Should return 422 code due to description length being shorter than 10 characters', async ({
    client,
    route,
  }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Some type',
        description: 'short',
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'minLength',
          field: 'description',
          message: 'description field must be at least 10',
          args: { minLength: 10 },
        },
      ],
    })
  })

  test('Should return 422 code due to name length being greater than 255 characters', async ({
    client,
    route,
  }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Some type',
        description:
          'descriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondes',
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'maxLength',
          field: 'description',
          message: 'description field must be up to 255',
          args: { maxLength: 255 },
        },
      ],
    })
  })

  test('Should return 422 code due to negative range input', async ({ client, route }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Some type',
        description: 'Some description',
        range: -1,
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'unsigned',
          field: 'range',
          message: 'unsigned validation failed',
        },
      ],
    })
  })

  test('Should return 422 code due to negative price input', async ({ client, route }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Some type',
        description: 'Some description',
        range: 10,
        price: -1,
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'unsigned',
          field: 'price',
          message: 'unsigned validation failed',
        },
      ],
    })
  })

  test('Should return 422 code due to negative minAndMaxNumber input', async ({
    client,
    route,
  }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Some type',
        description: 'Some description',
        range: 10,
        price: 5,
        minAndMaxNumber: -1,
      })
      .loginAs(admin!)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'unsigned',
          field: 'minAndMaxNumber',
          message: 'unsigned validation failed',
        },
      ],
    })
  })

  test('Should return 403 code because authenticated user is not an admin', async ({
    client,
    route,
  }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Some type',
        description: 'Some description',
        range: 10,
        price: 5,
        minAndMaxNumber: 10,
      })
      .loginAs(player!)

    response.assertStatus(403)
    response.assertBodyContains({
      statusCode: 403,
      message: 'Access denied',
    })
  })

  test('Should return 201 code and create a new game', async ({ client, route }) => {
    const response = await client
      .post(route('GamesController.store'))
      .json({
        type: 'Some type',
        description: 'Some description',
        range: 10,
        price: 5,
        minAndMaxNumber: 10,
        color: 'green',
      })
      .loginAs(admin!)
    response.assertStatus(201)
  })
})
