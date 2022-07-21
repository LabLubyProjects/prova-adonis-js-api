import { test } from '@japa/runner'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

test.group('Games.index', (gamesIndex) => {
  let player
  gamesIndex.setup(async () => {
    player = await User.findBy('email', 'player@player.com')
  })

  test('Show return 401 code because user is not logged in', async ({ client, route }) => {
    const response = await client.get(route('GamesController.index'))
    response.assertStatus(401)
    response.assertBodyContains({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  })

  test('Should return 200 code and all games available', async ({ client, route, assert }) => {
    const allGamesLength = (await Game.all()).length
    const response = await client.get(route('GamesController.index')).loginAs(player)
    response.assertStatus(200)
    assert.equal(allGamesLength, response.body().types.length)
  })
})
