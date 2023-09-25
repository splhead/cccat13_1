import { AccountDao } from '../repository/AccountDao'
import { CpfValidator } from '../../domain/CpfValidator'
import { MailerGateway } from '../../infra/gateway/MailerGateway'
import { Account } from '../../domain/entity/Account'

export class Signup {
  cpfValidator: CpfValidator
  mailerGateway: MailerGateway

  constructor(readonly accountDao: AccountDao) {
    this.cpfValidator = new CpfValidator()
    this.mailerGateway = new MailerGateway()
  }
  async execute(input: Input) {
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
}

type Input = {
  name: string
  email: string
  cpf: string
  isPassenger: boolean
  isDriver: boolean
  carPlate: string
}
