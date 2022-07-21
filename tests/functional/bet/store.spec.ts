import Mail from '@ioc:Adonis/Addons/Mail'
// import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Game from 'App/Models/Game'
import User from 'App/Models/User'
import { v4 } from 'uuid'

function generateRandomArrayOfNumbers(length: number, range: number) {
  const numbers: number[] = []
  let i = 0
  while (i < length) {
    const randomNumber = Math.floor(Math.random() * range)
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber)
      i++
    }
  }
  return numbers
}
test.group('Bets.store', (betsStore) => {
  let player
  let games
  betsStore.setup(async () => {
    player = await User.findBy('email', 'player@player.com')
    games = await Game.all()
  })

  // betsStore.each.setup(async () => {
  //   await Database.beginGlobalTransaction()
  //   return async () => await Database.rollbackGlobalTransaction()
  // })

  test('Show return 401 code because user is not logged in', async ({ client, route }) => {
    const response = await client.post(route('BetsController.store'))
    response.assertStatus(401)
    response.assertBodyContains({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  })

  test('Should return 422 code due to invalid numbers input', async ({ client, route }) => {
    const response = await client
      .post(route('BetsController.store'))
      .json({
        bets: [
          {
            gameId: games[0].id,
            numbers: '-012312.12-312',
          },
        ],
      })
      .loginAs(player)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'regex',
          field: 'bets.0.numbers',
          message: 'bets.0.numbers field with invalid format',
        },
      ],
    })
  })

  test('Should return 422 code due to inexistent game id', async ({ client, route }) => {
    const gameId = v4()
    const randomStringOfNumbers = generateRandomArrayOfNumbers(
      games[0].minAndMaxNumber,
      games[0].range
    ).join(',')
    const response = await client
      .post(route('BetsController.store'))
      .json({
        bets: [
          {
            gameId,
            numbers: randomStringOfNumbers,
          },
        ],
      })
      .loginAs(player)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'exists',
          field: 'bets.0.gameId',
          message: 'bets.0.gameId not found in us database',
        },
      ],
    })
  })

  test('Should return 400 code due to repeated numbers on a bet', async ({ client, route }) => {
    const randomArrayOfNumbers = generateRandomArrayOfNumbers(
      games[0].minAndMaxNumber,
      games[0].range
    )
    randomArrayOfNumbers[0] = randomArrayOfNumbers[1]
    const randomStringOfNumbers = randomArrayOfNumbers.join(',')
    const response = await client
      .post(route('BetsController.store'))
      .json({
        bets: [
          {
            gameId: games[0].id,
            numbers: randomStringOfNumbers,
          },
        ],
      })
      .loginAs(player)

    response.assertStatus(400)
    response.assertBodyContains({
      statusCode: 400,
      message: 'There are repeated numbers in a bet',
    })
  })

  test('Should return 400 code due to different length between numbers input and game minAndMaxNumber', async ({
    client,
    route,
  }) => {
    const randomStringOfNumbers = generateRandomArrayOfNumbers(
      games[0].minAndMaxNumber - 1,
      games[0].range
    ).join(',')
    const response = await client
      .post(route('BetsController.store'))
      .json({
        bets: [
          {
            gameId: games[0].id,
            numbers: randomStringOfNumbers,
          },
        ],
      })
      .loginAs(player)

    response.assertStatus(400)
    response.assertBodyContains({
      statusCode: 400,
      message: `A bet of type ${games[0].type} must have ${games[0].minAndMaxNumber} numbers`,
    })
  })

  test('Should return 400 code because a bet have a number greater than game maximum permitted', async ({
    client,
    route,
  }) => {
    const randomArrayOfNumbers = generateRandomArrayOfNumbers(
      games[0].minAndMaxNumber,
      games[0].range
    )
    randomArrayOfNumbers[0] = games[0].range + 1
    const randomStringOfNumbers = randomArrayOfNumbers.join(',')
    const response = await client
      .post(route('BetsController.store'))
      .json({
        bets: [
          {
            gameId: games[0].id,
            numbers: randomStringOfNumbers,
          },
        ],
      })
      .loginAs(player)

    response.assertStatus(400)
    response.assertBodyContains({
      statusCode: 400,
      message: 'A bet has numbers out of game range',
    })
  })

  test('Should return 400 code because total of bets is lower than carts minimum', async ({
    client,
    route,
  }) => {
    const randomStringOfNumbers = generateRandomArrayOfNumbers(
      games[0].minAndMaxNumber,
      games[0].range
    ).join(',')
    const response = await client
      .post(route('BetsController.store'))
      .json({
        bets: [
          {
            gameId: games[0].id,
            numbers: randomStringOfNumbers,
          },
        ],
      })
      .loginAs(player)

    response.assertStatus(400)
    response.assertBodyContains({
      statusCode: 400,
      message: 'Total value of bets is lower than cart minimum value',
    })
  })

  test('Should return 201 code and send an email to player', async ({ client, route, assert }) => {
    const mailer = Mail.fake()

    const bets: any[] = []
    for (const game of games) {
      for (let i = 0; i < 4; i++) {
        const randomStringOfNumbers = generateRandomArrayOfNumbers(
          game.minAndMaxNumber,
          game.range
        ).join(',')
        bets.push({ gameId: game.id, numbers: randomStringOfNumbers })
      }
    }
    const response = await client.post(route('BetsController.store')).json({ bets }).loginAs(player)
    response.assertStatus(201)
    assert.isTrue(mailer.exists((email) => email.subject === 'Congratulations for your new bet!'))
    Mail.restore()
  })
})
