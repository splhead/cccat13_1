import crypto from 'crypto'
import { AccountDaoDatabase } from './AccountDaoDatabase'
import { PgDatabase } from './PgDatabase'
import { RideDaoDatabase } from './RideDaoDatabase'
import { AccountDao } from './AccountDao'
import { RideDao } from './RideDao'

export class RideService {
  constructor(
    readonly rideDao: RideDao = new RideDaoDatabase(PgDatabase.getInstance()),
    readonly accountDao: AccountDao = new AccountDaoDatabase(
      PgDatabase.getInstance()
    )
  ) {}

  async requestRide(input: any) {
    const account = await this.accountDao.getById(input.passengerId)
    if (!account || !account.is_passenger) throw new Error('Não é passageiro!')
    const ridesNotCompleted = await this.rideDao.getActiveRidesByPassengerId(
      input.passengerId
    )
    if (ridesNotCompleted?.length > 0)
      throw new Error('Já existe uma corrida em andamento!')
    const rideId = crypto.randomUUID()
    const ride = {
      rideId,
      passengerId: input.passengerId,
      status: 'requested',
      date: new Date(),
      from: {
        lat: input.from.lat,
        long: input.from.long
      },
      to: {
        lat: input.to.lat,
        long: input.to.long
      }
    }
    await this.rideDao.save(ride)
    return { rideId }
  }

  async acceptRide(input: any) {
    const account = await this.accountDao.getById(input.driverId)
    if (!account || !account.is_driver) throw new Error('Não é motorista!')
    const ride = await this.getRide(input.rideId)
    if (ride.status !== 'requested')
      throw new Error('The ride is not requested')
    const ridesAcceptedOrInProgress =
      await this.rideDao.getActiveRidesByDriverId(input.driverId)
    if (ridesAcceptedOrInProgress?.length > 0)
      throw new Error('Motorista com outra corrida em andamento!')
    ride.rideId = input.rideId
    ride.driverId = input.driverId
    ride.status = 'accepted'
    await this.rideDao.update(ride)
    return { rideId: ride.rideId }
  }

  async getRide(rideId: string) {
    const ride = await this.rideDao.getById(rideId)
    return ride
  }

  async startRide(rideId: string) {
    const ride = await this.getRide(rideId)
    if (ride.status !== 'accepted') throw new Error('The ride is not accepted')
    ride.rideId = ride.ride_id
    ride.driverId = ride.driver_id
    ride.status = 'in_progress'
    await this.rideDao.update(ride)
  }
}
