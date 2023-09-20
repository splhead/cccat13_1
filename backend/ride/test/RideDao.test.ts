import crypto from 'crypto'
import { RideDaoDatabase } from '../src/RideDaoDatabase'
import { PgDatabase } from '../src/PgDatabase'
import { RideDao } from '../src/RideDao'
import { Ride } from '../src/domain/entity/Ride'

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
    const passengerId = crypto.randomUUID()
    const ride = Ride.create(
      passengerId,
      coord.from.lat,
      coord.from.long,
      coord.to.lat,
      coord.to.long
    )
    await rideDao.save(ride)
    const rideGot = await rideDao.getById(ride.rideId)
    console.log(rideGot)
    expect(rideGot.rideId).toBe(ride.rideId)
    expect(rideGot.passengerId).toBe(ride.passengerId)
    expect(rideGot.getStatus()).toBe('requested')
    expect(rideGot.fromLat).toBe(ride.fromLat)
    expect(rideGot.fromLong).toBe(ride.fromLong)
    expect(rideGot.toLat).toBe(ride.toLat)
    expect(rideGot.toLong).toBe(ride.toLong)
  })
})
