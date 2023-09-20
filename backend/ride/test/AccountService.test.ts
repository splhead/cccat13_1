import sinon from 'sinon'
import { AccountService } from '../src/AccountService'
import { PgDatabase } from '../src/PgDatabase'
import { MailerGateway } from '../src/MailerGateway'
import { AccountDaoDatabase } from '../src/AccountDaoDatabase'
import { AccountDaoMemory } from '../src/AccountDaoMemory'
import { Account } from '../src/domain/entity/Account'

describe('Account service', () => {
  let accountService: AccountService
  beforeAll(() => {
    accountService = new AccountService()
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
    expect(account?.accountId).toBeDefined()
    expect(account?.name).toBe(input.name)
    expect(account?.email).toBe(input.email)
    expect(account?.cpf).toBe(input.cpf)
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

  test('Deve criar um passageiro com stub', async function () {
    const input: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const stubSave = sinon.stub(AccountDaoDatabase.prototype, 'save').resolves()
    const stubGetByEmail = sinon
      .stub(AccountDaoDatabase.prototype, 'getByEmail')
      .resolves()

    const output = await accountService.signup(input)
    input.account_id = output.accountId
    const stubGetById = sinon
      .stub(AccountDaoDatabase.prototype, 'getById')
      .resolves(
        Account.create(
          input.name,
          input.email,
          input.cpf,
          input.isPassenger,
          false,
          ''
        )
      )
    const account = await accountService.getAccount(output.accountId)
    expect(account?.accountId).toBeDefined()
    expect(account?.name).toBe(input.name)
    expect(account?.email).toBe(input.email)
    expect(account?.cpf).toBe(input.cpf)
    stubSave.restore()
    stubGetByEmail.restore()
    stubGetById.restore()
  })

  test('Deve criar um passageiro com spy', async function () {
    const spy = sinon.spy(MailerGateway.prototype, 'send')
    const input: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const stubSave = sinon.stub(AccountDaoDatabase.prototype, 'save').resolves()
    const stubGetByEmail = sinon
      .stub(AccountDaoDatabase.prototype, 'getByEmail')
      .resolves()
    const output = await accountService.signup(input)
    input.account_id = output.accountId
    const stubGetById = sinon
      .stub(AccountDaoDatabase.prototype, 'getById')
      .resolves(
        Account.create(
          input.name,
          input.email,
          input.cpf,
          input.isPassenger,
          false,
          ''
        )
      )
    const account = await accountService.getAccount(output.accountId)
    expect(spy.calledOnce).toBeTruthy()
    expect(spy.calledWith(input.email, 'Verification')).toBeTruthy()
    spy.restore()
    stubSave.restore()
    stubGetByEmail.restore()
    stubGetById.restore()
  })

  test('Deve criar um passageiro com mock', async function () {
    const input: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const mock = sinon.mock(MailerGateway.prototype)
    mock.expects('send').withArgs(input.email, 'Verification').calledOnce
    const mockAccountDAO = sinon.mock(AccountDaoDatabase.prototype)
    mockAccountDAO.expects('save').resolves()
    mockAccountDAO.expects('getByEmail').resolves()
    const output = await accountService.signup(input)
    input.account_id = output.accountId
    mockAccountDAO
      .expects('getById')
      .resolves(
        Account.create(
          input.name,
          input.email,
          input.cpf,
          input.isPassenger,
          false,
          ''
        )
      )
    const account = await accountService.getAccount(output.accountId)
    mock.verify()
    mock.restore()
  })

  test('Deve criar um passageiro com fake', async function () {
    const accountDao = new AccountDaoMemory()
    const accountService = new AccountService(accountDao)
    const input: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const output = await accountService.signup(input)
    const account = await accountService.getAccount(output.accountId)
    expect(account?.accountId).toBeDefined()
    expect(account?.name).toBe(input.name)
    expect(account?.email).toBe(input.email)
    expect(account?.cpf).toBe(input.cpf)
  })
})
