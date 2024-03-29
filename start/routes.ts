import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

Route.where('id', Route.matchers.uuid())

// API VERSION 1.0
Route.group(() => {
  // Tests
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
  })

  // Public routes
  Route.group(() => {
    Route.post('users', 'UsersController.store')
  })

  // Authentication routes
  Route.group(() => {
    Route.post('login', 'AuthController.login')
    Route.post('forgot_password', 'AuthController.forgot_password')
    Route.post('reset_password', 'AuthController.reset_password')
  }).prefix('auth')

  // Player routes
  Route.group(() => {
    Route.resource('users', 'UsersController').except(['store', 'index', 'destroy'])
    Route.resource('games', 'GamesController').only(['index', 'show'])
    Route.resource('bets', 'BetsController').only(['index', 'show', 'store'])
  }).middleware(['auth', 'is:player'])

  // Admin routes
  Route.group(() => {
    Route.resource('users', 'UsersController').only(['index', 'destroy'])
    Route.post('users/allow_access', 'UsersController.AllowAccess')
    Route.resource('games', 'GamesController').except(['index', 'show'])
    Route.resource('carts', 'CartsController')
  }).middleware(['auth', 'is:admin'])
}).prefix('api/v1')
