import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import 'dayjs/locale/pt-br'
import User from 'App/Models/User'
import { produce } from 'App/Services/kafka'
// import { sendEmail } from 'App/Services/sendEmail'

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
          if (userWithBet.bets.length === 0) {
            await produce(userWithBet, 'new-bet-new-users')
            //await sendEmail(userWithBet, 'email/new_bet_reminder_for_new_users', 'Start betting!')
            return Logger.info('Reminder email sent successfully')
          }
          userWithBet.bets.sort((a, b) => b.createdAt.toUnixInteger() - a.createdAt.toUnixInteger())

          const { createdAt } = userWithBet.bets[0]

          const lastBetPlusOneWeek = dayjs(createdAt.toJSDate()).add(7, 'd').format()
          const currentDate = dayjs().format()
          if (lastBetPlusOneWeek < currentDate) {
            await produce(userWithBet, 'new-bet-by-week')
            // await sendEmail(userWithBet, 'email/new_bet_reminder_by_week', 'We miss you!')
            return Logger.info('Reminder email sent successfully')
          }
        })
      )
    } catch (error) {
      return Logger.error('Error sending reminder email')
    }
  }
}
