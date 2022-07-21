import { test } from '@japa/runner'
import Game from 'App/Models/Game'
import User from 'App/Models/User'
import { v4 } from 'uuid'

test.group('Games.show', (gamesShow) => {
  let player
  let game
  gamesShow.setup(async () => {
    player = await User.findBy('email', 'player@player.com')
    game = await Game.findBy('type', 'Quina')
  })

  test('Show return 401 code because user is not logged in', async ({ client, route }) => {
    const response = await client.get(route('GamesController.destroy', { id: game.id }))
    response.assertStatus(401)
    response.assertBodyContains({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  })

  test('Should return 200 code and return a single game', async ({ client, route, assert }) => {
    const response = await client
      .get(route('GamesController.show', { id: game.id }))
      .loginAs(player)
    response.assertStatus(200)
    assert.equal(game.id, response.body().id)
  })

  test('Should return 404 code because a game with that id was not found', async ({
    client,
    route,
  }) => {
    const idToFind = v4()
    const response = await client
      .get(route('GamesController.show', { id: idToFind }))
      .loginAs(player)
    response.assertStatus(404)
  })
})
