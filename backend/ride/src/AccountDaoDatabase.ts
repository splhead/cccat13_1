import { AccountDao } from './AccountDao'
import { PgDatabase } from './PgDatabase'

export class AccountDaoDatabase implements AccountDao {
  private connection: any

  constructor(pgDatabase: PgDatabase) {
    this.connection = pgDatabase.getConnection()
  }

  async save(data: AccountDto): Promise<void> {
    await this.connection.query(
      'insert into cccat13.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, date, is_verified, verification_code) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        data.accountId,
        data.name,
        data.email,
        data.cpf,
        data?.carPlate,
        !!data.isPassenger,
        !!data.isDriver,
        data.date,
        false,
        data.verificationCode
      ]
    )
  }

  async getById(accountId: string): Promise<any> {
    const [account] = await this.connection.query(
      'select * from cccat13.account where account_id = $1',
      [accountId]
    )
    return account
  }

  async getByEmail(email: string): Promise<any> {
    const [account] = await this.connection.query(
      'select * from cccat13.account where email = $1',
      [email]
    )
    return account
  }
}

export type AccountDto = {
  accountId: string
  name: string
  email: string
  cpf: string
  carPlate?: string
  isPassenger: boolean
  isDriver: boolean
  date: Date
  verified: boolean
  verificationCode: string
}
