import { AccountDao } from '../repository/AccountDao'

export class GetAccount {
  constructor(readonly accountDao: AccountDao) {}

  async execute(accountId: string) {
    const account = await this.accountDao.getById(accountId)
    return account
  }
}
