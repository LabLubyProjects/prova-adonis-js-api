import Server from '@ioc:Adonis/Core/Server'

Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  () => import('App/Middleware/CentralErrorHandler'),
])

Server.middleware.registerNamed({
  auth: () => import('App/Middleware/Auth'),
  is: () => import('App/Middleware/Is'),
})
