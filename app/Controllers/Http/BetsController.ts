import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bet from 'App/Models/Bet'
import Game from 'App/Models/Game'
import Cart from 'App/Models/Cart'
import StoreValidator from 'App/Validators/Bet/StoreValidator'

export default class BetsController {
  public async store({ request, response, auth }: HttpContextContract) {
    await request.validate(StoreValidator)
    const userId = auth.user?.id
    const { bets } = request.all()

    let totalCartValue = 0
    for (const bet of bets) {
      const currentGameAnalized = await Game.find(bet.gameId)
      const arrayOfBetNumbers = bet.numbers.split(',')

      if (arrayOfBetNumbers.length !== new Set(arrayOfBetNumbers).size)
        return response.badRequest({
          statusCode: 400,
          message: 'There are repeated numbers in a bet',
        })

      if (arrayOfBetNumbers.length !== currentGameAnalized!.minAndMaxNumber)
        return response.badRequest({
          statusCode: 400,
          message: `A bet of type ${currentGameAnalized!.type} must have ${
            currentGameAnalized!.minAndMaxNumber
          } numbers`,
        })

      if (arrayOfBetNumbers.some((betNumber) => Number(betNumber) > currentGameAnalized!.range))
        return response.badRequest({
          statusCode: 400,
          message: 'A bet has numbers out of game range',
        })

      totalCartValue += currentGameAnalized!.price
      bet.userId = userId!
    }

    const cart = await Cart.query().first()
    const minimumValue = cart ? cart.minCartValue : 30

    if (totalCartValue < minimumValue)
      return response.badRequest({
        statusCode: 400,
        message: 'Total value of bets is lower than cart minimum value',
      })

    try {
      await Bet.createMany(bets)
      return response.created({ message: 'Bets saved successfully' })
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error while processing bets' })
    }
  }
}
