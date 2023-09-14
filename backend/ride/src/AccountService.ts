import crypto from 'crypto'
import { CpfValidator } from './CpfValidator'
import { AccountDao } from './AccountDao'
import { PgDatabase } from './PgDatabase'

export class AccountService {
  cpfValidator: CpfValidator
  accountDao: AccountDao

  constructor(pgDatabase: PgDatabase) {
    this.cpfValidator = new CpfValidator()
    this.accountDao = new AccountDao(pgDatabase)
  }

  async sendEmail(email: string, subject: string, message: string) {
    console.log(email, subject, message)
  }

  async signup(input: any) {
    const accountId = crypto.randomUUID()
    const verificationCode = crypto.randomUUID()
    const date = new Date()
    const [existingAccount] = await this.accountDao.getByEmail(input.email)
    if (existingAccount) throw new Error('Account already exists')
    if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/)) throw new Error('Invalid name')
    if (!input.email.match(/^(.+)@(.+)$/)) throw new Error('Invalid email')
    if (!this.cpfValidator.validate(input.cpf)) throw new Error('Invalid cpf')
    if (input.isDriver && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/))
      throw new Error('Invalid plate')
    const { name, email, cpf, carPlate, isPassenger, isDriver } = input
    await this.accountDao.create({
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
    await this.sendEmail(
      input.email,
      'Verification',
      `Please verify your code at first login ${verificationCode}`
    )
    return {
      accountId
    }
  }

  async getAccount(accountId: string) {
    const account = await this.accountDao.get(accountId)
    return account
  }
}
