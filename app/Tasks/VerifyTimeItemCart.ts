import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import 'dayjs/locale/pt-br'
import User from 'App/Models/User'
import { sendEmail } from 'App/Services/sendEmail'

export default class VerifyTimeItemCart extends BaseTask {
  public static get schedule() {
    return '0 0 9 * * *'
  }

  public static get useLock() {
    return false
  }

  public async handle() {
    dayjs.extend(isLeapYear)
    dayjs.locale('pt-br')

    try {
      const usersWithBets = await User.query().preload('bets')

      await Promise.all(
        usersWithBets.map(async (userWithBet) => {
          userWithBet.bets.sort((a, b) => a.createdAt.toUnixInteger() - b.createdAt.toUnixInteger())
          const { createdAt } = userWithBet.bets[0]

          const nowPlusOneWeek = dayjs(createdAt.toJSDate()).add(7, 'd').format()
          const currentDate = dayjs().format()

          if (nowPlusOneWeek < currentDate) {
            await sendEmail(userWithBet, 'new_bet_reminder', 'We miss you')
            return Logger.info('Reminder email sent successfully')
          }
        })
      )
    } catch (error) {
      return Logger.error('Error sending reminder email')
    }
  }
}
