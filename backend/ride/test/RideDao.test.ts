import crypto from 'crypto'
import { RideDao, RideDto } from '../src/RideDaoDatabase'
import { PgDatabase } from '../src/PgDatabase'

describe('RideDao', () => {
  let rideDao: RideDao

  beforeAll(() => {
    rideDao = new RideDao(PgDatabase.getInstance())
  })

  afterAll(() => PgDatabase.disconnect())
  test('deve criar uma corrida e buscar a corrida', async () => {
    const ride = {
      rideId: crypto.randomUUID(),
      passengerId: crypto.randomUUID(),
      driverId: crypto.randomUUID(),
      status: 'completed',
      fare: 10,
      distance: 55,
      fromLat: 1,
      fromLong: 12,
      toLat: 5,
      toLong: 13,
      date: new Date()
    }
    await rideDao.save(ride)
    const rideGot = await rideDao.getById(ride.rideId)
    expect(rideGot).toStrictEqual(ride)
  })

  test('deve apagar a corrida', async () => {
    const ride = {
      rideId: crypto.randomUUID(),
      passengerId: crypto.randomUUID(),
      driverId: crypto.randomUUID(),
      status: 'requested',
      fare: 10,
      distance: 5,
      fromLat: 1,
      fromLong: 12,
      toLat: 5,
      toLong: 13,
      date: new Date()
    }
    await rideDao.save(ride)
    let rideGot = await rideDao.getById(ride.rideId)
    expect(rideGot).toStrictEqual(ride)
    await rideDao.delete(ride.rideId)
    rideGot = await rideDao.getById(ride.rideId)
    expect(rideGot).toBeUndefined()
  })
})
