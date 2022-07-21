import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Game from 'App/Models/Game'
import StoreValidator from 'App/Validators/Game/StoreValidator'
import UpdateValidator from 'App/Validators/Game/UpdateValidator'

export default class GamesController {
  public async index({ request, response }: HttpContextContract) {
    const { page, perPage, ...inputs } = request.qs()
    try {
      const cart = await Database.from('cart').first()
      if (page || perPage) {
        const games = await Game.query()
          .filter(inputs)
          .paginate(page || 1, perPage || 10)
        const { meta, data } = games.serialize()
        return response.ok({ min_cart_value: cart.min_cart_value, meta, types: data })
      }

      const games = await Game.query().filter(inputs)

      return response.ok({ min_cart_value: cart.min_cart_value, types: games })
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

    return response.created(newGame)
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

    return response.ok({ message: 'Game deleted successfully' })
  }
}
