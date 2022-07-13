import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

Route.where('id', Route.matchers.uuid())

Route.get('test_db_connection', async ({ response }: HttpContextContract) => {
  await Database.report().then((health) => {
    const { healthy, message } = health.health

    return healthy ? response.ok({ message }) : response.internalServerError({ message })
  })
})
