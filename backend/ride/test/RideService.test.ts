import crypto from 'crypto'
import { AccountDao, AccountDto } from '../src/AccountDao'
import { Coord, RideService } from '../src/RideService'
import { RideDao } from '../src/RideDao'
import { PgDatabase } from '../src/PgDatabase'

describe('Ride service', () => {
  let rideService: RideService
  let rideDao: RideDao
  let accountDao: AccountDao
  let from: Coord
  let to: Coord

  beforeAll(() => {
    rideService = new RideService(PgDatabase.getInstance())
    accountDao = new AccountDao(PgDatabase.getInstance())
    rideDao = new RideDao(PgDatabase.getInstance())
    from = {
      lat: 34,
      long: 28
    }
    to = {
      lat: 56,
      long: 62
    }
  })

  afterAll(() => PgDatabase.disconnect())
  test('não deve solicitar uma corrida para um passageiro sem conta', () => {
    expect(
      rideService.requestRide(crypto.randomUUID(), from, to)
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
    await accountDao.create(driver)

    expect(
      rideService.requestRide(driver.accountId, from, to)
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
    await accountDao.create(passenger)

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

    await rideDao.create(ride)

    expect(
      rideService.requestRide(passenger.accountId, from, to)
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
    await accountDao.create(passenger)

    const { ride_id } = await rideService.requestRide(
      passenger.accountId,
      from,
      to
    )
    expect(ride_id).toBeDefined()
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
    await accountDao.create(driver)
    await expect(() =>
      rideService.acceptRide(driver.accountId)
    ).rejects.toThrowError('Não é motorista!')
  })

  test('deve lançar erro caso tente aceitar uma corrida tendo outras com status "accepted" ou "in_progress', async () => {
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
    await accountDao.create(driver)
    await rideDao.create({
      rideId: crypto.randomUUID(),
      passengerId: crypto.randomUUID(),
      driverId: driver.accountId,
      status: 'accepted',
      fare: 10,
      distance: 55,
      fromLat: 1,
      fromLong: 12,
      toLat: 5,
      toLong: 13,
      date: new Date()
    })

    expect(rideService.acceptRide(driver.accountId)).rejects.toThrowError(
      'Motorista com outra corrida em andamento!'
    )
  })
})
