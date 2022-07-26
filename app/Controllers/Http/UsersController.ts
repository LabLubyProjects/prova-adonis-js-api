import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { produce } from 'App/Services/kafka'
// import { sendEmail } from 'App/Services/sendEmail'
import AllowAccessValidator from 'App/Validators/User/AllowAccessValidator'
import StoreValidator from 'App/Validators/User/StoreValidator'
import UpdateValidator from 'App/Validators/User/UpdateValidator'
import { DateTime } from 'luxon'

export default class UsersController {
  public async index({ response, request }: HttpContextContract) {
    const { page, perPage, ...inputs } = request.qs()

    try {
      if (page || perPage) {
        const users = await User.query()
          .preload('roles', (role) => role.select('name', 'description'))
          .preload('bets', (bet) =>
            bet
              .select('game_id', 'numbers')
              .where('created_at', '>=', DateTime.local().minus({ month: 1 }).toString())
          )
          .filter(inputs)
          .paginate(page || 1, perPage || 10)

        return response.ok(users)
      }

      const users = await User.query()
        .preload('roles', (role) => role.select('name', 'description'))
        .preload('bets', (bet) =>
          bet
            .select('game_id', 'numbers')
            .where('created_at', '>=', DateTime.local().minus({ month: 1 }).toString())
        )
        .filter(inputs)

      return response.ok(users)
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error fetching users' })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const userBody = request.only(['name', 'cpf', 'email', 'password'])

    let newUser

    const transaction = await Database.transaction()

    try {
      newUser = new User()
      newUser.useTransaction(transaction)
      newUser.name = userBody.name
      newUser.cpf = userBody.cpf
      newUser.password = userBody.password
      newUser.email = userBody.email
      await newUser.save()
      const playerRole = await Role.findBy('name', 'player')
      if (playerRole) await newUser.related('roles').attach([playerRole.id], transaction)
    } catch (error) {
      await transaction.rollback()
      return response.badRequest({ statusCode: 400, message: 'Error creating user' })
    }

    try {
      await produce(newUser, 'new-users')
      //await sendEmail(newUser, 'email/welcome', 'Welcome to Bets System!')
    } catch (error) {
      await transaction.rollback()
      return response.badRequest({ statusCode: 400, message: 'Error sending welcome email' })
    }
    await transaction.commit()

    let userFind
    try {
      userFind = await User.query()
        .where('id', newUser.id)
        .preload('roles', (role) => role.select('name', 'description'))
        .first()
    } catch (error) {
      return response.notFound({ statusCode: 404, message: 'Error finding user' })
    }

    return response.created(userFind)
  }

  public async show({ response, params }: HttpContextContract) {
    const userId = params.id

    const user = await User.query()
      .where('id', userId)
      .preload('roles', (role) => role.select('name', 'description'))
      .preload('bets', (bet) =>
        bet
          .select('game_id', 'numbers')
          .where('created_at', '>=', DateTime.local().minus({ month: 1 }).toString())
      )
      .first()
    if (!user) return response.notFound({ statusCode: 404, message: 'User not found' })
    return response.ok(user)
  }

  public async update({ request, response, params, auth }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const userId = params.id
    const loggedUserRoles = await User.query().where('id', auth.user!.id).preload('roles')
    if (
      userId !== auth.user?.id &&
      loggedUserRoles.filter((role) => role.name === 'admin').length === 0
    )
      return response.forbidden({
        statusCode: 403,
        message: 'You are not allowed to update this user',
      })

    const userBody = request.only(['name', 'cpf', 'email', 'password'])

    let updatedUser

    const transaction = await Database.transaction()

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
    let userFind
    try {
      userFind = await User.query()
        .where('id', updatedUser.id)
        .preload('roles', (role) => role.select('name', 'description'))
        .first()
    } catch (error) {
      return response.notFound({ statusCode: 404, message: 'Error finding user' })
    }

    return response.ok(userFind)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const userId = params.id

    const user = await User.find(userId)

    if (!user) return response.notFound({ statusCode: 404, message: 'User not found' })

    await user.delete()

    return response.ok(user)
  }

  public async AllowAccess({ response, request }: HttpContextContract) {
    await request.validate(AllowAccessValidator)

    const { userId, roles } = request.all()

    try {
      const userAllow = await User.findByOrFail('id', userId)

      let roleIds: string[] = []
      await Promise.all(
        roles.map(async (roleName) => {
          const hasRole = await Role.findBy('name', roleName)
          if (hasRole) roleIds.push(hasRole.id)
        })
      )

      await userAllow.related('roles').sync(roleIds)
      return response.ok({ message: 'User roles updated successfully' })
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error allowing access' })
    }
  }
}
