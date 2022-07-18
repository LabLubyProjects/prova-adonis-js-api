import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export async function sendEmail(user: User, template: string, subject: string): Promise<void> {
  await Mail.send((message) => {
    message
      .from('betsSystem@email.com')
      .to(user.email)
      .subject(subject)
      .htmlView(template, { user })
  })
}
