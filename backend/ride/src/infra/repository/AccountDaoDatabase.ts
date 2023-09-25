import { AccountDao } from '../../application/repository/AccountDao'
import { PgDatabase } from '../database/PgDatabase'
import { Account } from '../../domain/entity/Account'
import { Connection } from '../database/Connection'

export class AccountDaoDatabase implements AccountDao {
  constructor(readonly connection: Connection) {}

  async save(account: Account): Promise<void> {
    await this.connection.query(
      'insert into cccat13.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, date, is_verified, verification_code) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        account.accountId,
        account.name,
        account.email,
        account.cpf,
        account?.carPlate,
        !!account.isPassenger,
        !!account.isDriver,
        account.date,
        false,
        account.verificationCode
      ]
    )
  }

  async getById(accountId: string): Promise<Account | undefined> {
    const [account] = await this.connection.query(
      'select * from cccat13.account where account_id = $1',
      [accountId]
    )
    if (!account) return
    const {
      account_id,
      name,
      cpf,
      email,
      is_passenger,
      is_driver,
      car_plate,
      date,
      verification_code
    } = account
    return Account.restore(
      account_id,
      name,
      email,
      cpf,
      is_passenger,
      is_driver,
      car_plate,
      date,
      verification_code
    )
  }

  async getByEmail(email: string): Promise<Account | undefined> {
    const [account] = await this.connection.query(
      'select * from cccat13.account where email = $1',
      [email]
    )
    if (!account) return
    const {
      account_id,
      name,
      cpf,
      is_passenger,
      is_driver,
      car_plate,
      date,
      verification_code
    } = account
    return Account.restore(
      account_id,
      name,
      email,
      cpf,
      is_passenger,
      is_driver,
      car_plate,
      date,
      verification_code
    )
  }
}
