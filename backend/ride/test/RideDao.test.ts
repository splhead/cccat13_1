import crypto from 'crypto'
import { RideDaoDatabase } from '../src/RideDaoDatabase'
import { PgDatabase } from '../src/PgDatabase'
import { RideDao } from '../src/RideDao'

describe('RideDao', () => {
  let rideDao: RideDao
  let coord: {
    from: { lat: number; long: number }
    to: { lat: number; long: number }
  }

  beforeAll(() => {
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
  test('deve criar uma corrida e buscar a corrida', async () => {
    const ride = {
      rideId: crypto.randomUUID(),
      passengerId: crypto.randomUUID(),
      driverId: crypto.randomUUID(),
      status: 'completed',
      fare: 10,
      distance: 55,
      ...coord,
      date: new Date()
    }
    await rideDao.save(ride)
    const rideGot = await rideDao.getById(ride.rideId)
    expect(rideGot).toStrictEqual(ride)
  })
})
