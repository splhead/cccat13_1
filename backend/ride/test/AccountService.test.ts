import { AccountService } from '../src/AccountService'
import { PgDatabase } from '../src/PgDatabase'

describe('Account service', () => {
  let accountService: AccountService
  beforeAll(() => {
    accountService = new AccountService(PgDatabase.getInstance())
  })
  afterAll(() => PgDatabase.disconnect())
  test('Deve criar um passageiro', async function () {
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const output = await accountService.signup(input)
    const account = await accountService.getAccount(output.accountId)
    expect(account.account_id).toBeDefined()
    expect(account.name).toBe(input.name)
    expect(account.email).toBe(input.email)
    expect(account.cpf).toBe(input.cpf)
  })

  test('Não deve criar um passageiro com cpf inválido', async function () {
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705500',
      isPassenger: true
    }
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Invalid cpf')
    )
  })

  test('Não deve criar um passageiro com nome inválido', async function () {
    const input = {
      name: 'John',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Invalid name')
    )
  })

  test('Não deve criar um passageiro com email inválido', async function () {
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@`,
      cpf: '95818705552',
      isPassenger: true
    }
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Invalid email')
    )
  })

  test('Não deve criar um passageiro com conta existente', async function () {
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    await accountService.signup(input)
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Account already exists')
    )
  })

  test('Deve criar um motorista', async function () {
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const output = await accountService.signup(input)
    expect(output.accountId).toBeDefined()
  })

  test('Não deve criar um motorista com placa do carro inválida', async function () {
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA999',
      isDriver: true
    }
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Invalid plate')
    )
  })
})
