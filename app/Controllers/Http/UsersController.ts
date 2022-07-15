import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import StoreValidator from 'App/Validators/User/StoreValidator'
import UpdateValidator from 'App/Validators/User/UpdateValidator'
import { DateTime } from 'luxon'

export default class UsersController {
  public async index({ response, request }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()
    try {
      const userQuery = User.query()
        .preload('roles', (role) => role.select('name', 'description'))
        .preload('bets', (bet) =>
          bet
            .select('game_id', 'numbers')
            .where('created_at', '>=', DateTime.local().minus({ month: 1 }).toLocaleString())
        )
        .filter(inputs)
      if (!noPaginate) {
        userQuery.paginate(page || 1, perPage || 10)
      }
      const users = await userQuery
      return response.ok(users)
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error fetching users' })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const userBody = request.only(['name', 'cpf', 'email', 'password'])

    let newUser

    const transaction = await Database.beginGlobalTransaction()

    try {
      newUser = await User.create(userBody)
      const playerRole = await Role.findBy('name', 'player')
      if (playerRole) await newUser.related('roles').attach([playerRole.id], transaction)
      newUser = await User.query()
        .where('id', newUser.id)
        .preload('roles', (role) => role.select('name', 'description'))
        .first()
    } catch (error) {
      await transaction.rollback()
      return response.badRequest({ statusCode: 400, message: 'Error creating user' })
    }

    await transaction.commit()

    return response.created(newUser)
  }

  public async show({ response, params }: HttpContextContract) {
    const userId = params.id

    const user = await User.query()
      .where('id', userId)
      .preload('roles', (role) => role.select('name', 'description'))
      .preload('bets', (bet) =>
        bet
          .select('game_id', 'numbers')
          .where('created_at', '>=', DateTime.local().minus({ month: 1 }).toLocaleString())
      )
      .first()
    if (!user) return response.notFound({ statusCode: 404, message: 'User not found' })
    return response.ok(user)
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const userId = params.id
    const userBody = request.only(['name', 'cpf', 'email', 'password'])

    let updatedUser

    const transaction = await Database.beginGlobalTransaction()

    try {
      updatedUser = await User.find(userId)
      updatedUser.useTransaction(transaction)
      await updatedUser.merge(userBody).save()
      updatedUser = await User.query()
        .where('id', updatedUser.id)
        .preload('roles', (role) => role.select('name', 'description'))
        .first()
    } catch (error) {
      await transaction.rollback()
      return response.badRequest({ statusCode: 400, message: 'Error updating user' })
    }

    await transaction.commit()

    return response.created(updatedUser)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const userId = params.id

    const user = await User.find(userId)

    if (!user) return response.notFound({ statusCode: 404, message: 'User not found' })

    await user.delete()

    return response.ok(user)
  }
}
