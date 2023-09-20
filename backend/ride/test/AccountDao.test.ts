import crypto from 'crypto'
import { AccountDao } from '../src/AccountDao'
import { AccountDaoDatabase } from '../src/AccountDaoDatabase'
import { PgDatabase } from '../src/PgDatabase'

describe('Account dao', () => {
  let accountDao: AccountDao
  let pgDatabase: PgDatabase
  let account: any
  beforeEach(() => {
    pgDatabase = PgDatabase.getInstance()
    accountDao = new AccountDaoDatabase(pgDatabase)
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
