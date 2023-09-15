import crypto from 'crypto'
import { CpfValidator } from './CpfValidator'
import { AccountDaoDatabase } from './AccountDaoDatabase'
import { PgDatabase } from './PgDatabase'
import { AccountDao } from './AccountDao'
import { MailerGateway } from './MailerGateway'

export class AccountService {
  cpfValidator: CpfValidator
  mailerGateway: MailerGateway

  constructor(
    readonly accountDao: AccountDao = new AccountDaoDatabase(
      PgDatabase.getInstance()
    )
  ) {
    this.cpfValidator = new CpfValidator()
    this.mailerGateway = new MailerGateway()
  }

  async signup(input: any) {
    const accountId = crypto.randomUUID()
    const verificationCode = crypto.randomUUID()
    const date = new Date()
    const existingAccount = await this.accountDao.getByEmail(input.email)
    if (existingAccount) throw new Error('Account already exists')
    if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/)) throw new Error('Invalid name')
    if (!input.email.match(/^(.+)@(.+)$/)) throw new Error('Invalid email')
    if (!this.cpfValidator.validate(input.cpf)) throw new Error('Invalid cpf')
    if (input.isDriver && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/))
      throw new Error('Invalid plate')
    const { name, email, cpf, carPlate, isPassenger, isDriver } = input
    await this.accountDao.save({
      accountId,
      name,
      email,
      cpf,
      carPlate,
      isPassenger,
      isDriver,
      date,
      verified: false,
      verificationCode
    })
    await this.mailerGateway.send(
      email,
      'Verification',
      `Please verify your code at first login ${verificationCode}`
    )
    return {
      accountId
    }
  }

  async getAccount(accountId: string) {
    const account = await this.accountDao.getById(accountId)
    return account
  }
}
