import crypto from 'crypto'
import { AccountDao } from '../../src/application/repository/AccountDao'
import { PgDatabase } from '../../src/infra/database/PgDatabase'
import { AccountDaoDatabase } from '../../src/infra/repository/AccountDaoDatabase'

describe('Account dao', () => {
  let accountDao: AccountDao
  let account: any

  beforeEach(() => {
    accountDao = new AccountDaoDatabase(
      PgDatabase.getInstance().getConnection()
    )
    account = {
      accountId: crypto.randomUUID(),
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true,
      date: new Date(),
      verificationCode: crypto.randomUUID()
    }
  })

  afterAll(() => PgDatabase.disconnect())
  test('Deve criar um registro na tabela account e consultar por email', async function () {
    await accountDao.save(account)
    const savedAccount = await accountDao.getByEmail(account.email)
    expect(savedAccount?.accountId).toBeDefined()
    expect(savedAccount?.name).toBe(account.name)
    expect(savedAccount?.email).toBe(account.email)
    expect(savedAccount?.cpf).toBe(account.cpf)
    expect(savedAccount?.isPassenger).toBeTruthy()
    expect(savedAccount?.date).toBeDefined()
    expect(savedAccount?.verificationCode).toBe(account.verificationCode)
  })

  test('Deve criar um registro na tabela account e consultar por account_id', async function () {
    await accountDao.save(account)
    const savedAccount = await accountDao.getById(account.accountId)
    expect(savedAccount?.accountId).toBeDefined()
    expect(savedAccount?.name).toBe(account.name)
    expect(savedAccount?.email).toBe(account.email)
    expect(savedAccount?.cpf).toBe(account.cpf)
    expect(savedAccount?.isPassenger).toBeTruthy()
    expect(savedAccount?.date).toBeDefined()
    expect(savedAccount?.verificationCode).toBe(account.verificationCode)
  })
})
