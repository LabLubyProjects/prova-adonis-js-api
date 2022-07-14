import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

Route.where('id', Route.matchers.uuid())

// Test Routes
Route.group(() => {
  Route.get('test_db_connection', async ({ response }: HttpContextContract) => {
    await Database.report().then((health) => {
      const { healthy, message } = health.health
      return healthy ? response.ok({ message }) : response.internalServerError({ message })
    })
  })
  Route.get('test_access_level_admin', async ({ response }: HttpContextContract) => {
    response.ok({ statusCode: 200, message: 'Access Level Admin' })
  }).middleware(['auth', 'is:admin'])
  Route.get('test_access_level_player', async ({ response }: HttpContextContract) => {
    response.ok({ statusCode: 200, message: 'Access Level Player' })
  }).middleware(['auth', 'is:player'])
}).prefix('api/v1')

Route.post('login', 'AuthController.login')

// Authenticated routes group
Route.group(() => {})
  .prefix('api/v1')
  .middleware('auth')
