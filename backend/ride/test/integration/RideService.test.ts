import crypto from 'crypto'
import { PgDatabase } from '../../src/infra/database/PgDatabase'
import { RideDao } from '../../src/application/repository/RideDao'
import { AccountDao } from '../../src/application/repository/AccountDao'
import { RideDaoDatabase } from '../../src/infra/repository/RideDaoDatabase'
import { Account } from '../../src/domain/entity/Account'
import { RequestRide } from '../../src/application/usecase/RequestRide'
import { AccountDaoDatabase } from '../../src/infra/repository/AccountDaoDatabase'
import { Signup } from '../../src/application/usecase/Signup'
import { GetRide } from '../../src/application/usecase/GetRide'
import { AcceptRide } from '../../src/application/usecase/AcceptRide'
import { StartRide } from '../../src/application/usecase/StartRide'

describe('Ride service', () => {
  let rideDao: RideDao
  let accountDao: AccountDao
  let requestRide: RequestRide
  let getRide: GetRide
  let acceptRide: AcceptRide
  let startRide: StartRide
  let signup: Signup
  let coord: {
    from: { lat: number; long: number }
    to: { lat: number; long: number }
  }

  beforeEach(() => {
    accountDao = new AccountDaoDatabase(
      PgDatabase.getInstance().getConnection()
    )
    rideDao = new RideDaoDatabase(PgDatabase.getInstance().getConnection())
    requestRide = new RequestRide(accountDao, rideDao)
    signup = new Signup(accountDao)
    getRide = new GetRide(rideDao)
    acceptRide = new AcceptRide(accountDao, rideDao)
    startRide = new StartRide(rideDao)
    coord = {
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    }
  })

  afterAll(() => PgDatabase.disconnect())

  test('Caso uma corrida seja solicitada por uma conta que não seja de passageiro deve lançar um erro', async () => {
    expect(
      requestRide.execute({ passengerId: crypto.randomUUID(), ...coord })
    ).rejects.toThrowError('Não é passageiro!')

    const cpf = '14748857056'
    const name = 'Jonh Doe'
    const email = 'jonh@gas.co'
    const carPlate = 'AND1235'
    const isPassenger = false
    const isDriver = true
    const driver = Account.create(
      name,
      email,
      cpf,
      isPassenger,
      isDriver,
      carPlate
    )
    await accountDao.save(driver)
    expect(
      requestRide.execute({ passengerId: driver.accountId, ...coord })
    ).rejects.toThrowError('Não é passageiro!')
  })

  test('Caso uma corrida seja solicitada por um passageiro e ele já tenha outra corrida em andamento lançar um erro', async function () {
    const inputSignup: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignup = await signup.execute(inputSignup)
    const inputRequestRide = {
      passengerId: outputSignup.accountId,
      ...coord
    }
    await requestRide.execute(inputRequestRide)
    await expect(() => requestRide.execute(inputRequestRide)).rejects.toThrow(
      new Error('Já existe uma corrida em andamento!')
    )
  })

  test('Deve solicitar uma corrida e receber a rideId', async () => {
    const cpf = '14748857056'
    const name = 'Jonh Doe'
    const email = 'jonh@gas.co'
    const isPassenger = true
    const isDriver = false
    const passenger = Account.create(
      name,
      email,
      cpf,
      isPassenger,
      isDriver,
      ''
    )
    await accountDao.save(passenger)
    const { rideId } = await requestRide.execute({
      passengerId: passenger.accountId,
      ...coord
    })
    expect(rideId).toBeDefined()
  })

  test('Deve solicitar e consultar uma corrida', async function () {
    const inputSignup: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignup = await signup.execute(inputSignup)
    const inputRequestRide = {
      passengerId: outputSignup.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    const outputGetRide = await getRide.execute(outputRequestRide.rideId)
    expect(outputGetRide.getStatus()).toBe('requested')
    expect(outputGetRide.passengerId).toBe(outputSignup.accountId)
    expect(outputGetRide.fromLat).toBe(inputRequestRide.from.lat)
    expect(outputGetRide.fromLong).toBe(inputRequestRide.from.long)
    expect(outputGetRide.toLat).toBe(inputRequestRide.to.lat)
    expect(outputGetRide.toLong).toBe(inputRequestRide.to.long)
    expect(outputGetRide.date).toBeDefined()
  })
  // test('não deve aceitar suas proprias corridas caso também seja passageiro', () => {})
  test('não deve aceitar a corrida caso não seja motorista', async () => {
    expect(
      acceptRide.execute({
        driverId: crypto.randomUUID(),
        rideId: crypto.randomUUID()
      })
    ).rejects.toThrowError('Não é motorista!')
    const cpf = '14748857056'
    const name = 'Jonh Doe'
    const email = 'jonh@gas.co'
    const carPlate = 'AND1235'
    const isPassenger = true
    const isDriver = false
    const driver = Account.create(
      name,
      email,
      cpf,
      isPassenger,
      isDriver,
      carPlate
    )
    await accountDao.save(driver)
    await expect(() =>
      acceptRide.execute({
        driverId: driver.accountId,
        rideId: crypto.randomUUID()
      })
    ).rejects.toThrowError('Não é motorista!')
  })

  test('Não deve aceitar uma corrida se o motorista já tiver outra corrida em andamento', async function () {
    const inputSignupPassenger1: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger1 = await signup.execute(inputSignupPassenger1)
    const inputRequestRide1 = {
      passengerId: outputSignupPassenger1.accountId,
      ...coord
    }
    const inputSignupPassenger2: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger2 = await signup.execute(inputSignupPassenger2)
    const inputRequestRide2 = {
      passengerId: outputSignupPassenger2.accountId,
      ...coord
    }
    const outputRequestRide1 = await requestRide.execute(inputRequestRide1)
    const outputRequestRide2 = await requestRide.execute(inputRequestRide2)

    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await signup.execute(inputSignupDriver)
    const inputAcceptRide1 = {
      rideId: outputRequestRide1.rideId,
      driverId: outputSignupDriver.accountId
    }
    const inputAcceptRide2 = {
      rideId: outputRequestRide2.rideId,
      driverId: outputSignupDriver.accountId
    }
    await acceptRide.execute(inputAcceptRide1)
    await expect(() => acceptRide.execute(inputAcceptRide2)).rejects.toThrow(
      'Motorista com outra corrida em andamento!'
    )
  })

  test('Deve solicitar uma corrida e aceitar uma corrida', async function () {
    const inputSignupPassenger: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger = await signup.execute(inputSignupPassenger)
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await signup.execute(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await acceptRide.execute(inputAcceptRide)
    const outputGetRide = await getRide.execute(outputRequestRide.rideId)
    expect(outputGetRide.getStatus()).toBe('accepted')
    expect(outputGetRide.driverId).toBe(outputSignupDriver.accountId)
  })

  test('Não deve aceitar uma corrida se o status da corrida não for requested', async function () {
    const inputSignupPassenger: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger = await signup.execute(inputSignupPassenger)
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await signup.execute(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await acceptRide.execute(inputAcceptRide)
    await expect(() => acceptRide.execute(inputAcceptRide)).rejects.toThrow(
      new Error('The ride is not requested')
    )
  })

  test('Caso status da corrida diferente de "accepted" deve lançar um erro ao tentar iniciá-la', async () => {
    const inputSignupPassenger: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger = await signup.execute(inputSignupPassenger)
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    expect(startRide.execute(outputRequestRide.rideId)).rejects.toThrowError(
      'The ride is not accepted'
    )
  })
  test('deve iniciar uma corrida', async () => {
    const inputSignupPassenger: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger = await signup.execute(inputSignupPassenger)
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await signup.execute(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await acceptRide.execute(inputAcceptRide)
    await startRide.execute(outputRequestRide.rideId)
    const outputGetRide = await getRide.execute(outputRequestRide.rideId)
    expect(outputGetRide.getStatus()).toBe('in_progress')
  })
})
