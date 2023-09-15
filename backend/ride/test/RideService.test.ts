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

  beforeAll(() => {
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
  test('não deve solicitar uma corrida para um passageiro sem conta', () => {
    expect(
      rideService.requestRide({ passengerId: crypto.randomUUID(), ...coord })
    ).rejects.toThrowError('Passageiro não encontrado!')
  })
  test('Não deve solicitar uma corrida caso não seja passageiro', async () => {
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
      rideService.requestRide({ driverId: driver.accountId, ...coord })
    ).rejects.toThrowError('Não é passageiro!')
  })

  test('não deve criar a corrida caso exista outra para o mesmo passageiro com status diferente de "completed"', async () => {
    const passenger: AccountDto = {
      accountId: crypto.randomUUID(),
      cpf: '14748857056',
      name: 'Jonh Doe',
      email: 'jonh@gas.co',
      carPlate: 'AND1235',
      isPassenger: true,
      isDriver: true,
      date: new Date(),
      verified: true,
      verificationCode: crypto.randomUUID()
    }
    await accountDao.save(passenger)

    const ride = {
      rideId: crypto.randomUUID(),
      passengerId: passenger.accountId,
      driverId: crypto.randomUUID(),
      status: 'requested',
      fare: 10,
      distance: 5.5,
      fromLat: 1,
      fromLong: 12,
      toLat: 5,
      toLong: 13,
      date: new Date()
    }

    await rideDao.save(ride)

    expect(
      rideService.requestRide({ passengerId: passenger.accountId, ...coord })
    ).rejects.toThrowError('Já existe uma corrida em andamento!')
  })

  test('deve solicitar a corrida', async () => {
    const passenger: AccountDto = {
      accountId: crypto.randomUUID(),
      cpf: '14748857056',
      name: 'Jonh Doe',
      email: 'jonh@gas.co',
      carPlate: 'AND1235',
      isPassenger: true,
      isDriver: true,
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
  test('não deve aceitar uma corrida caso não possua conta', () => {
    expect(rideService.acceptRide(crypto.randomUUID())).rejects.toThrowError(
      'Motorista não encontrado!'
    )
  })
  test('não deve aceitar suas proprias corridas caso também seja passageiro', () => {})
  test('não deve aceitar a corrida caso não seja motorista', async () => {
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
    console.log(driver.accountId)
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
    const rideService = new RideService()
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
})
