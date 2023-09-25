import { Ride } from '../../domain/entity/Ride'

export interface RideDao {
  save(ride: Ride): Promise<void>
  update(ride: Ride): Promise<void>
  getById(rideId: string): Promise<Ride>
  getActiveRidesByPassengerId(passengerId: string): Promise<Ride[]>
  getActiveRidesByDriverId(driverId: string): Promise<Ride[]>
}
