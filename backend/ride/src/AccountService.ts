import crypto from 'crypto'
import { CpfValidator } from './CpfValidator'
import { AccountDaoDatabase } from './AccountDaoDatabase'
import { PgDatabase } from './PgDatabase'
import { AccountDao } from './AccountDao'
import { MailerGateway } from './MailerGateway'
import { Account } from './domain/entity/Account'

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
    const existingAccount = await this.accountDao.getByEmail(input.email)
    if (existingAccount) throw new Error('Account already exists')
    const { name, email, cpf, carPlate, isPassenger, isDriver } = input
    const account = Account.create(
      name,
      email,
      cpf,
      isPassenger,
      isDriver,
      carPlate
    )
    await this.accountDao.save(account)
    await this.mailerGateway.send(
      email,
      'Verification',
      `Please verify your code at first login ${account.verificationCode}`
    )
    return {
      accountId: account.accountId
    }
  }

  async getAccount(accountId: string) {
    const account = await this.accountDao.getById(accountId)
    return account
  }
}
