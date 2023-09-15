import { RideDao } from './RideDao'
import { PgDatabase } from './PgDatabase'

export class RideDaoDatabase implements RideDao {
  private connection: any

  constructor(pgDatabase: PgDatabase) {
    this.connection = pgDatabase.getConnection()
  }

  async save(ride: any): Promise<void> {
    await this.connection.query(
      'insert into cccat13.ride (ride_id, passenger_id, from_lat, from_long, to_lat, to_long, status, date) values ($1,$2,$3,$4,$5,$6,$7,$8)',
      [
        ride.rideId,
        ride.passengerId,
        ride.from.lat,
        ride.from.long,
        ride.to.lat,
        ride.to.long,
        ride.status,
        ride.date
      ]
    )
  }

  async getActiveRidesByPassengerId(passengerId: string) {
    const rides = await this.connection.query(
      "select * from cccat13.ride where passenger_id = $1 and status in ('requested', 'accepted', 'in_progress')",
      [passengerId, 'completed']
    )
    return rides
  }

  async getActiveRidesByDriverId(driverId: string) {
    const rides = await this.connection.query(
      "select * from cccat13.ride where driver_id = $1 and status in ('accepted','in_progress')",
      [driverId]
    )
    return rides
  }

  async getById(rideId: string): Promise<any> {
    const query = 'select * from cccat13.ride where ride_id = $1'
    const [ride] = await this.connection.query(query, [rideId])
    return ride
  }

  async update(ride: any): Promise<void> {
    await this.connection.query(
      'update cccat13.ride set driver_id = $1, status = $2 where ride_id = $3',
      [ride.driverId, ride.status, ride.rideId]
    )
  }
}
