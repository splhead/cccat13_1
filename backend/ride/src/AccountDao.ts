import { Account } from './domain/entity/Account'

export interface AccountDao {
  save(account: Account): Promise<void>
  getByEmail(email: string): Promise<Account | undefined>
  getById(accountId: string): Promise<Account | undefined>
}
