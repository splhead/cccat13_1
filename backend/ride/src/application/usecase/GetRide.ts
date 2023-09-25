import { RideDao } from '../repository/RideDao'

export class GetRide {
  constructor(readonly rideDao: RideDao) {}

  async execute(rideId: string) {
    const ride = await this.rideDao.getById(rideId)
    return ride
  }
}
