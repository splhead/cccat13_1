import { Dao } from './Dao'
import { PgDatabase } from './PgDatabase'

export class AccountDao implements Dao {
  private connection: any

  constructor(pgDatabase: PgDatabase) {
    this.connection = pgDatabase.getConnection()
  }

  async create(data: AccountDto): Promise<void> {
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

  async get(id: any): Promise<any> {
    const [account] = await this.connection.query(
      'select * from cccat13.account where account_id = $1',
      [id]
    )
    return account
  }

  async getByEmail(email: string): Promise<any> {
    return await this.connection.query(
      'select * from cccat13.account where email = $1',
      [email]
    )
  }

  async update(data: AccountDto): Promise<void> {
    await this.connection.query(
      'update cccat13.account set (email=$2, is_passenger=$3, is_driver=$4, car_plate=$5) where account_id = $1',
      [
        data.accountId,
        data.email,
        data.isPassenger,
        data.isDriver,
        data.carPlate
      ]
    )
  }

  async delete(id: any): Promise<void> {
    await this.connection.query(
      'delete from cccat13.account where account_id = $1',
      [id]
    )
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
