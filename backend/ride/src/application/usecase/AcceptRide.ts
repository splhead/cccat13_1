import { AccountDao } from '../repository/AccountDao'
import { RideDao } from '../repository/RideDao'

export class AcceptRide {
  constructor(readonly accountDao: AccountDao, readonly rideDao: RideDao) {}

  async execute(input: Input) {
    const account = await this.accountDao.getById(input.driverId)
    if (!account?.isDriver) throw new Error('Não é motorista!')
    const ride = await this.rideDao.getById(input.rideId)
    ride.accept(input.driverId)
    const ridesAcceptedOrInProgress =
      await this.rideDao.getActiveRidesByDriverId(input.driverId)
    if (ridesAcceptedOrInProgress?.length > 0)
      throw new Error('Motorista com outra corrida em andamento!')
    await this.rideDao.update(ride)
    return { rideId: ride.rideId }
  }
}

type Input = {
  driverId: string
  rideId: string
}
