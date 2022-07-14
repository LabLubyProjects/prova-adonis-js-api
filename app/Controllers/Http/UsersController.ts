import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import StoreValidator from 'App/Validators/User/StoreValidator'
import UpdateValidator from 'App/Validators/User/UpdateValidator'

export default class UsersController {
  public async index({}: HttpContextContract) {}

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
      transaction.rollback()
      return response.badRequest({ statusCode: 400, message: 'Error creating user' })
    }

    await transaction.commit()

    return response.created(newUser)
  }

  public async show({}: HttpContextContract) {}

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
      transaction.rollback()
      return response.badRequest({ statusCode: 400, message: 'Error updating user' })
    }

    await transaction.commit()

    return response.created(updatedUser)
  }

  public async destroy({}: HttpContextContract) {}
}
