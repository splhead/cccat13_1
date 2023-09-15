import { RideDao } from './RideDao'
import { PgDatabase } from './PgDatabase'

export class RideDaoDatabase implements RideDao {
  private connection: any

  constructor(pgDatabase: PgDatabase) {
    this.connection = pgDatabase.getConnection()
  }

  async save(data: RideDto): Promise<void> {
    const {
      rideId,
      passengerId,
      driverId,
      status,
      fare,
      distance,
      fromLat,
      fromLong,
      toLat,
      toLong,
      date
    } = data
    await this.connection.query(
      'insert into cccat13.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, date) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [
        rideId,
        passengerId,
        driverId,
        status,
        fare,
        distance,
        fromLat,
        fromLong,
        toLat,
        toLong,
        date
      ]
    )
  }

  async getActiveRidesByPassengerId(passengerId: string) {
    const [rides] = await this.connection.query(
      'select * from cccat13.ride where passenger_id = $1 and status != $2',
      [passengerId, 'completed']
    )
    if (!rides) return
    if (rides && !Array.isArray(rides)) return rides
    const mappedRides = rides.map((ride: any) => this.mapperToDto(ride))
    return mappedRides
  }

  async getActiveRidesByDriverId(driverId: string) {
    const [rides] = await this.connection.query(
      "select * from cccat13.ride where passenger_id = $1 and status in ('accepted','in_progress')",
      [driverId]
    )
    if (!rides) return
    if (rides && !Array.isArray(rides)) return rides
    const mappedRides = rides.map((ride: any) => this.mapperToDto(ride))
    return mappedRides
  }

  async getById(rideId: string): Promise<any> {
    const query = 'select * from cccat13.ride where ride_id = $1'
    const [ride] = await this.connection.query(query, [rideId])
    if (!ride) return
    return this.mapperToDto(ride)
  }

  async update(ride: any): Promise<void> {
    await this.connection.query(
      'update cccat13.ride set driver_id = $1, status = $2 where ride_id = $3',
      [ride.driverId, ride.status, ride.rideId]
    )
  }

  private mapperToDto(ride: any): RideDto {
    return {
      rideId: ride.ride_id,
      passengerId: ride.passenger_id,
      driverId: ride?.driver_id,
      status: ride.status,
      fare: ride.fare & Number(ride.fare),
      distance: ride.distance & Number(ride.distance),
      fromLat: Number(ride.from_lat),
      fromLong: Number(ride.from_long),
      toLat: Number(ride.to_lat),
      toLong: Number(ride.to_long),
      date: new Date(ride.date)
    }
  }
}

export type RideDto = {
  rideId: string
  passengerId: string
  driverId?: string
  status: string
  fare?: number
  distance?: number
  fromLat: number
  fromLong: number
  toLat: number
  toLong: number
  date: Date
}
