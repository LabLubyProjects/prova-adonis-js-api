import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Game from 'App/Models/Game'
import StoreValidator from 'App/Validators/Game/StoreValidator'
import UpdateValidator from 'App/Validators/Game/UpdateValidator'

export default class GamesController {
  public async index({ request, response }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()
    try {
      const gamesQuery = Game.query().filter(inputs)
      if (!noPaginate) gamesQuery.paginate(page || 1, perPage || 10)
      const games = await gamesQuery
      return response.ok(games)
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error fetching games' })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const gameBody = request.only([
      'type',
      'description',
      'range',
      'price',
      'minAndMaxNumber',
      'color',
    ])

    let newGame

    try {
      newGame = await Game.create(gameBody)
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error creating game' })
    }

    return response.ok(newGame)
  }

  public async show({ response, params }: HttpContextContract) {
    const gameId = params.id

    const game = await Game.find(gameId)

    if (!game) return response.notFound({ statusCode: 404, message: 'Game not found' })

    return response.ok(game)
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const gameId = params.id

    const gameBody = request.only([
      'type',
      'description',
      'range',
      'price',
      'minAndMaxNumber',
      'color',
    ])

    let updatedGame

    try {
      updatedGame = await Game.find(gameId)
      await updatedGame.merge(gameBody).save()
      updatedGame = await Game.find(gameId)
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error updating game' })
    }

    return response.ok(updatedGame)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const gameId = params.id

    const game = await Game.find(gameId)

    if (!game) return response.notFound({ statusCode: 404, message: 'Game not found' })

    await game.delete()

    return response.ok(game)
  }
}
