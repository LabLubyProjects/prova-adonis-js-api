import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bet from 'App/Models/Bet'
import Game from 'App/Models/Game'
import Cart from 'App/Models/Cart'
import StoreValidator from 'App/Validators/Bet/StoreValidator'
import Database from '@ioc:Adonis/Lucid/Database'
import { produce } from 'App/Services/kafka'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
// import { sendEmail } from 'App/Services/sendEmail'

export default class BetsController {
  public async index({ request, response }: HttpContextContract) {
    const { page, perPage } = request.qs()
    try {
      const betsQuery = Bet.query()
      if (page || perPage) await betsQuery.paginate(page || 1, perPage || 10)
      const bets = await betsQuery
      return response.ok(bets)
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error fetching bets' })
    }
  }

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
    }

    const cart = await Cart.query().first()
    const minimumValue = cart ? cart.minCartValue : 30

    if (totalCartValue < minimumValue)
      return response.badRequest({
        statusCode: 400,
        message: 'Total value of bets is lower than cart minimum value',
      })

    const transaction = await Database.transaction()

    try {
      Array.prototype.forEach.call(bets, async (bet) => {
        let newBet = new Bet()
        newBet.useTransaction(transaction)
        ;(newBet.gameId = bet.gameId), (newBet.numbers = bet.numbers), (newBet.userId = userId!)
        await newBet.save()
      })
    } catch (error) {
      await transaction.rollback()
      return response.badRequest({ statusCode: 400, message: 'Error while processing bets' })
    }

    try {
      await produce(auth.user!, 'new-bet')
      const allAdmins = await User.query().preload('roles')
      allAdmins.forEach(async (admin) => {
        const adminJSON = admin.serialize()
        if (adminJSON.roles.some((role) => role.name === 'admin'))
          await produce({ ...adminJSON, playerName: auth.user!.name }, 'new-bet-admin-report')
      })
      //await sendEmail(auth.user!, 'email/new_bet', 'Congratulations for your new bet!')
    } catch (error) {
      await transaction.rollback()
      return response.badRequest({ statusCode: 400, message: 'Error sending new bets email' })
    }

    await transaction.commit()

    return response.created({ message: 'Bets saved successfully' })
  }

  public async show({ response, params }: HttpContextContract) {
    const betId = params.id

    const bet = await Bet.find(betId)

    if (!bet) return response.notFound({ statusCode: 404, message: 'Bet not found' })

    return response.ok(bet)
  }
}
