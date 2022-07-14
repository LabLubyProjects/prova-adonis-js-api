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
  }).middleware(['auth', 'is:player,admin'])
}).prefix('api/v1')

// Public routes
Route.group(() => {
  Route.post('login', 'AuthController.login')
  Route.post('users', 'UsersController.store')
}).prefix('api/v1')

// Authenticated routes group
Route.group(() => {
  Route.resource('users', 'UsersController').except(['store'])
})
  .prefix('api/v1')
  .middleware('auth')
