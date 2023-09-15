import crypto from 'crypto'
import { AccountDaoDatabase, AccountDto } from '../src/AccountDaoDatabase'
import { RideService } from '../src/RideService'

import { PgDatabase } from '../src/PgDatabase'
import { RideDao } from '../src/RideDao'
import { AccountDao } from '../src/AccountDao'
import { RideDaoDatabase } from '../src/RideDaoDatabase'
import { AccountService } from '../src/AccountService'

describe('Ride service', () => {
  let rideService: RideService
  let accountService: AccountService
  let rideDao: RideDao
  let accountDao: AccountDao
  let coord: {
    from: { lat: number; long: number }
    to: { lat: number; long: number }
  }

  beforeEach(() => {
    rideService = new RideService()
    accountService = new AccountService()
    accountDao = new AccountDaoDatabase(PgDatabase.getInstance())
    rideDao = new RideDaoDatabase(PgDatabase.getInstance())
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
      rideService.requestRide({ passengerId: crypto.randomUUID(), ...coord })
    ).rejects.toThrowError('Não é passageiro!')

    const driver: AccountDto = {
      accountId: crypto.randomUUID(),
      cpf: '14748857056',
      name: 'Jonh Doe',
      email: 'jonh@gas.co',
      carPlate: 'AND1235',
      isPassenger: false,
      isDriver: true,
      date: new Date(),
      verified: true,
      verificationCode: crypto.randomUUID()
    }
    await accountDao.save(driver)
    expect(
      rideService.requestRide({ passengerId: driver.accountId, ...coord })
    ).rejects.toThrowError('Não é passageiro!')
  })

  test('Caso uma corrida seja solicitada por um passageiro e ele já tenha outra corrida em andamento lançar um erro', async function () {
    const inputSignup: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignup = await accountService.signup(inputSignup)
    const inputRequestRide = {
      passengerId: outputSignup.accountId,
      ...coord
    }
    await rideService.requestRide(inputRequestRide)
    await expect(() =>
      rideService.requestRide(inputRequestRide)
    ).rejects.toThrow(new Error('Já existe uma corrida em andamento!'))
  })

  test('Deve solicitar uma corrida e receber a rideId', async () => {
    const passenger: AccountDto = {
      accountId: crypto.randomUUID(),
      cpf: '14748857056',
      name: 'Jonh Doe',
      email: 'jonh@gas.co',
      isPassenger: true,
      isDriver: false,
      date: new Date(),
      verified: true,
      verificationCode: crypto.randomUUID()
    }
    await accountDao.save(passenger)
    const { rideId } = await rideService.requestRide({
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
    const outputSignup = await accountService.signup(inputSignup)
    const inputRequestRide = {
      passengerId: outputSignup.accountId,
      ...coord
    }
    const outputRequestRide = await rideService.requestRide(inputRequestRide)
    const outputGetRide = await rideService.getRide(outputRequestRide.rideId)
    expect(outputGetRide.status).toBe('requested')
    expect(outputGetRide.passenger_id).toBe(outputSignup.accountId)
    expect(parseFloat(outputGetRide.from_lat)).toBe(inputRequestRide.from.lat)
    expect(parseFloat(outputGetRide.from_long)).toBe(inputRequestRide.from.long)
    expect(parseFloat(outputGetRide.to_lat)).toBe(inputRequestRide.to.lat)
    expect(parseFloat(outputGetRide.to_long)).toBe(inputRequestRide.to.long)
    expect(outputGetRide.date).toBeDefined()
  })
  // test('não deve aceitar suas proprias corridas caso também seja passageiro', () => {})
  test('não deve aceitar a corrida caso não seja motorista', async () => {
    expect(rideService.acceptRide(crypto.randomUUID())).rejects.toThrowError(
      'Não é motorista!'
    )
    const driver: AccountDto = {
      accountId: crypto.randomUUID(),
      cpf: '14748857056',
      name: 'Jonh Doe',
      email: 'jonh@gas.co',
      carPlate: 'AND1235',
      isPassenger: false,
      isDriver: false,
      date: new Date(),
      verified: true,
      verificationCode: crypto.randomUUID()
    }
    await accountDao.save(driver)
    await expect(() =>
      rideService.acceptRide({ driverId: driver.accountId })
    ).rejects.toThrowError('Não é motorista!')
  })

  test('Não deve aceitar uma corrida se o motorista já tiver outra corrida em andamento', async function () {
    const inputSignupPassenger1: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger1 = await accountService.signup(
      inputSignupPassenger1
    )
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
    const outputSignupPassenger2 = await accountService.signup(
      inputSignupPassenger2
    )
    const inputRequestRide2 = {
      passengerId: outputSignupPassenger2.accountId,
      ...coord
    }
    const outputRequestRide1 = await rideService.requestRide(inputRequestRide1)
    const outputRequestRide2 = await rideService.requestRide(inputRequestRide2)

    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await accountService.signup(inputSignupDriver)
    const inputAcceptRide1 = {
      rideId: outputRequestRide1.rideId,
      driverId: outputSignupDriver.accountId
    }
    const inputAcceptRide2 = {
      rideId: outputRequestRide2.rideId,
      driverId: outputSignupDriver.accountId
    }
    await rideService.acceptRide(inputAcceptRide1)
    await expect(() =>
      rideService.acceptRide(inputAcceptRide2)
    ).rejects.toThrow('Motorista com outra corrida em andamento!')
  })

  test('Deve solicitar uma corrida e aceitar uma corrida', async function () {
    const inputSignupPassenger: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger = await accountService.signup(
      inputSignupPassenger
    )
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await rideService.requestRide(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await accountService.signup(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await rideService.acceptRide(inputAcceptRide)
    const outputGetRide = await rideService.getRide(outputRequestRide.rideId)
    expect(outputGetRide.status).toBe('accepted')
    expect(outputGetRide.driver_id).toBe(outputSignupDriver.accountId)
  })

  test('Não deve aceitar uma corrida se o status da corrida não for requested', async function () {
    const inputSignupPassenger: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const outputSignupPassenger = await accountService.signup(
      inputSignupPassenger
    )
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await rideService.requestRide(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await accountService.signup(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await rideService.acceptRide(inputAcceptRide)
    await expect(() => rideService.acceptRide(inputAcceptRide)).rejects.toThrow(
      new Error('The ride is not requested')
    )
  })
})
