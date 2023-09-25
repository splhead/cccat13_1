import { RideDao } from '../repository/RideDao'

export class StartRide {
  constructor(readonly rideDao: RideDao) {}

  async execute(rideId: string) {
    const ride = await this.rideDao.getById(rideId)
    ride.start()
    await this.rideDao.update(ride)
  }
}
