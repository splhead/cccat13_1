import crypto from 'crypto'
import { AccountDaoDatabase } from './AccountDaoDatabase'
import { PgDatabase } from './PgDatabase'
import { RideDaoDatabase } from './RideDaoDatabase'
import { AccountDao } from './AccountDao'
import { RideDao } from './RideDao'
import { Ride } from './domain/entity/Ride'

export class RideService {
  constructor(
    readonly rideDao: RideDao = new RideDaoDatabase(PgDatabase.getInstance()),
    readonly accountDao: AccountDao = new AccountDaoDatabase(
      PgDatabase.getInstance()
    )
  ) {}

  async requestRide(input: any) {
    const account = await this.accountDao.getById(input.passengerId)
    if (!account?.isPassenger) throw new Error('Não é passageiro!')
    const ridesNotCompleted = await this.rideDao.getActiveRidesByPassengerId(
      input.passengerId
    )
    if (ridesNotCompleted?.length > 0)
      throw new Error('Já existe uma corrida em andamento!')
    const ride = Ride.create(
      input.passengerId,
      input.from.lat,
      input.from.long,
      input.to.lat,
      input.to.long
    )
    await this.rideDao.save(ride)
    return { rideId: ride.rideId }
  }

  async acceptRide(input: any) {
    const account = await this.accountDao.getById(input.driverId)
    if (!account?.isDriver) throw new Error('Não é motorista!')
    const ride = await this.getRide(input.rideId)
    ride.accept(input.driverId)
    const ridesAcceptedOrInProgress =
      await this.rideDao.getActiveRidesByDriverId(input.driverId)
    if (ridesAcceptedOrInProgress?.length > 0)
      throw new Error('Motorista com outra corrida em andamento!')
    await this.rideDao.update(ride)
    return { rideId: ride.rideId }
  }

  async getRide(rideId: string) {
    const ride = await this.rideDao.getById(rideId)
    return ride
  }

  async startRide(rideId: string) {
    const ride = await this.getRide(rideId)
    ride.start()
    await this.rideDao.update(ride)
  }
}
