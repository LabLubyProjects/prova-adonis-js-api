import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import UpdateValidator from 'App/Validators/Cart/UpdateValidator'

export default class CartsController {
  public async index({ response }: HttpContextContract) {
    const cart = await Database.from('cart').first()

    if (!cart) return response.notFound({ error: 404, message: 'Cart not found' })

    return response.ok(cart)
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const { minCartValue } = request.all()

    try {
      const cart = await Database.from('cart').firstOrFail()
      if (!cart) return response.notFound({ error: 404, message: 'Cart not found' })
      await Database.rawQuery(`UPDATE cart SET min_cart_value=${minCartValue}`)
      return response.ok({ message: 'Cart updated successfully' })
    } catch (error) {
      return response.badRequest({ statusCode: 400, message: 'Error updating cart' })
    }
  }
}
