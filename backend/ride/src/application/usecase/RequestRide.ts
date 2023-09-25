import { Ride } from '../../domain/entity/Ride'
import { AccountDao } from '../repository/AccountDao'
import { RideDao } from '../repository/RideDao'

export class RequestRide {
  constructor(readonly accountDao: AccountDao, readonly rideDao: RideDao) {}

  async execute(input: Input) {
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
}

type Input = {
  passengerId: string
  from: {
    lat: number
    long: number
  }
  to: {
    lat: number
    long: number
  }
}
