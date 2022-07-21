import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Game from 'App/Models/Game'
import User from 'App/Models/User'
import { v4 } from 'uuid'

test.group('Games.destroy', async (gamesDestroy) => {
  let admin
  let player
  let game
  gamesDestroy.setup(async () => {
    admin = await User.findBy('email', 'admin@admin.com')
    player = await User.findBy('email', 'player@player.com')
    game = await Game.findBy('type', 'Quina')
  })

  gamesDestroy.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return async () => await Database.rollbackGlobalTransaction()
  })

  test('Should return 404 code because a game with that id was not found', async ({
    client,
    route,
  }) => {
    const idToFind = v4()
    const response = await client
      .delete(route('GamesController.destroy', { id: idToFind }))
      .loginAs(admin!)
    response.assertStatus(404)
  })

  test('Should return 403 code because user is not an admin', async ({ client, route }) => {
    const response = await client
      .delete(route('GamesController.destroy', { id: game.id }))
      .loginAs(player!)
    response.assertStatus(403)
  })

  test('Should return 200 code because and delete game', async ({ client, route, assert }) => {
    const response = await client
      .delete(route('GamesController.destroy', { id: game.id }))
      .loginAs(admin!)
    response.assertStatus(200)
    const deletedGame = await Game.find(game.id)
    assert.isNull(deletedGame)
  })
})
