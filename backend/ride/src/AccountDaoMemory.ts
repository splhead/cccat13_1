import { AccountDao } from './AccountDao'

export class AccountDaoMemory implements AccountDao {
  accounts: any = []

  async save(account: any): Promise<void> {
    this.accounts.push(account)
  }

  async getByEmail(email: string): Promise<any> {
    const account = this.accounts.find(
      (account: any) => account.email === email
    )
    if (!account) return
    account.account_id = account.accountId
    return account
  }

  async getById(accountId: string): Promise<any> {
    const account = this.accounts.find(
      (account: any) => account.accountId === accountId
    )
    account.account_id = account.accountId
    return account
  }
}
